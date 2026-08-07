"""In-memory sliding-window rate limiter and account-lockout tracker.

Note: state lives in-process only. If the app is scaled to multiple
workers/instances, move this to Redis or an external store.
"""

import threading
import time
from collections import defaultdict, deque
from typing import Dict, Optional

from fastapi import HTTPException, Request, status


def client_ip(request: Request) -> str:
    """Best-effort client IP, honoring X-Forwarded-For behind a proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: Dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._hits[key]
            while bucket and now - bucket[0] > window_seconds:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            return True

    def reset(self, key: str) -> None:
        with self._lock:
            self._hits.pop(key, None)


class LockoutTracker:
    def __init__(self, threshold: int, lockout_minutes: int) -> None:
        self.threshold = threshold
        self.lockout_seconds = lockout_minutes * 60
        self._failures: Dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def is_locked(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._failures[key]
            while bucket and now - bucket[0] > self.lockout_seconds:
                bucket.popleft()
            return len(bucket) >= self.threshold

    def register_failure(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            self._failures[key].append(now)

    def reset(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)


class RateLimiter:
    """Combined per-key rate limit + lockout used by auth/expensive endpoints."""

    def __init__(self, limit: int, window_seconds: int,
                 lockout_threshold: int = 0, lockout_minutes: int = 0) -> None:
        self.limiter = SlidingWindowLimiter()
        self.lockout = LockoutTracker(lockout_threshold, lockout_minutes) if lockout_threshold else None
        self.limit = limit
        self.window = window_seconds

    def check(self, key: str) -> None:
        if self.lockout and self.lockout.is_locked(key):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Try again later.",
            )
        if not self.limiter.allow(key, self.limit, self.window):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down.",
            )

    def register_failure(self, key: str) -> None:
        if self.lockout:
            self.lockout.register_failure(key)

    def reset(self, key: str) -> None:
        self.limiter.reset(key)
        if self.lockout:
            self.lockout.reset(key)


# Shared instances, wired to config values in auth_routes.
def make_login_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(
        settings.RATE_LIMIT_LOGIN,
        settings.RATE_LIMIT_LOGIN_WINDOW,
        lockout_threshold=settings.ACCOUNT_LOCKOUT_THRESHOLD,
        lockout_minutes=settings.ACCOUNT_LOCKOUT_MINUTES,
    )


def make_register_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(settings.RATE_LIMIT_REGISTER, settings.RATE_LIMIT_REGISTER_WINDOW)


def make_refresh_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(settings.RATE_LIMIT_REFRESH, settings.RATE_LIMIT_REFRESH_WINDOW)


def make_forgot_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(settings.RATE_LIMIT_FORGOT, settings.RATE_LIMIT_FORGOT_WINDOW)


def make_predict_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(settings.RATE_LIMIT_PREDICT, settings.RATE_LIMIT_PREDICT_WINDOW)


def make_nearby_limiter() -> RateLimiter:
    from backend.config import settings

    return RateLimiter(settings.RATE_LIMIT_NEARBY, settings.RATE_LIMIT_NEARBY_WINDOW)
