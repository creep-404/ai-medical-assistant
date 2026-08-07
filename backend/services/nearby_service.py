import json
import logging
import time
from math import radians, cos, sin, asin, sqrt
from typing import Dict, List, Optional

import requests

logger = logging.getLogger("nearby_service")

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
]
USER_AGENT = "MediAssistAI/1.0 (educational healthcare project)"

OVERPASS_TAGS = {
    "all": "hospital|clinic|doctors|dentist|pharmacy",
    "hospital": "hospital",
    "clinic": "clinic",
    "doctor": "doctors|dentist",
}

_CACHE: Dict[str, tuple] = {}
CACHE_TTL_SECONDS = 300


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * asin(sqrt(a))


class NearbySearchError(Exception):
    """Raised when the external hospital/location service cannot be reached."""


def geocode_city(city: str) -> Optional[Dict]:
    params = {"q": city, "format": "json", "limit": 1, "addressdetails": 1}
    headers = {"User-Agent": USER_AGENT}
    url = NOMINATIM_URL
    try:
        logger.info("geocode_city -> GET %s params=%s", url, params)
        response = requests.get(url, params=params, headers=headers, timeout=15)
        logger.info("geocode_city <- status=%s len=%s", response.status_code, len(response.text))
        response.raise_for_status()
        results = response.json()
        if not results:
            logger.warning("geocode_city: no results for %r", city)
            return None
        item = results[0]
        return {
            "lat": float(item["lat"]),
            "lng": float(item["lon"]),
            "display_name": item.get("display_name"),
        }
    except (requests.RequestException, ValueError, TypeError) as exc:
        logger.error("geocode_city error for %r: %s", city, exc)
        return None


def _build_overpass_query(lat: float, lng: float, radius_meters: int, place_type: str) -> str:
    tags = OVERPASS_TAGS.get(place_type, OVERPASS_TAGS["all"])
    return f"""
    [out:json][timeout:25];
    (
      nwr["amenity"~"^({tags})$"](around:{radius_meters},{lat},{lng});
      nwr["healthcare"~"^({tags})$"](around:{radius_meters},{lat},{lng});
    );
    out center tags;
    """


def _query_overpass(query: str, lat: float, lng: float) -> List[Dict]:
    """Query Overpass across multiple mirrors with retries. Returns element dicts."""
    cache_key = f"{round(lat, 2)}:{round(lng, 2)}:{query}"
    cached = _CACHE.get(cache_key)
    if cached and (time.time() - cached[0]) < CACHE_TTL_SECONDS:
        logger.info("overpass cache hit for %s (%d elements)", cache_key, len(cached[1]))
        return cached[1]

    attempts = [
        ("overpass-api.de", "https://overpass-api.de/api/interpreter", 45),
        ("overpass-api.de (retry)", "https://overpass-api.de/api/interpreter", 45),
        ("osm.ch", "https://overpass.osm.ch/api/interpreter", 15),
        ("kumi.systems", "https://overpass.kumi.systems/api/interpreter", 15),
    ]
    last_error = None
    for index, (name, url, timeout) in enumerate(attempts):
        try:
            logger.info(
                "overpass -> POST %s body=%s", url, query.replace("\n", " ").strip()
            )
            response = requests.post(
                url,
                data={"data": query},
                headers={"User-Agent": USER_AGENT},
                timeout=timeout,
            )
            logger.info(
                "overpass <- %s status=%s len=%s",
                name,
                response.status_code,
                len(response.text),
            )
            if response.status_code == 429:
                last_error = f"Overpass {name} rate-limited (HTTP 429). Retrying."
                logger.warning(last_error)
                time.sleep(1 + index)
                continue
            if response.status_code != 200:
                last_error = f"Overpass {name} returned HTTP {response.status_code}: {response.text[:200]}"
                logger.warning(last_error)
                continue
            try:
                data = response.json()
            except ValueError:
                last_error = f"Overpass {name} returned invalid JSON: {response.text[:200]}"
                logger.warning(last_error)
                continue
            elements = data.get("elements", [])
            if elements:
                _CACHE[cache_key] = (time.time(), elements)
                return elements
            # Valid 200 with zero elements = genuinely no facilities here.
            # Treat as an authoritative empty result, not a failure.
            remark = data.get("remark")
            if remark:
                logger.info("Overpass %s returned remark: %s", name, remark)
            logger.info("Overpass %s returned valid empty result (0 elements).", name)
            _CACHE[cache_key] = (time.time(), [])
            return []
        except requests.RequestException as exc:
            last_error = f"Overpass {name} request failed: {exc}"
            logger.warning(last_error)
    if last_error:
        logger.error("All Overpass attempts failed. Last error: %s", last_error)
        raise NearbySearchError(last_error)
    return []


def _safe_website(url: Optional[str]) -> Optional[str]:
    """Only return http(s) URLs. Anything else (javascript:, data:, etc.) is dropped."""
    if not url:
        return None
    url = url.strip()
    if url.lower().startswith(("http://", "https://")):
        return url[:500]
    return None


def _extract_tag_value(tags: Dict, *keys: str) -> Optional[str]:
    for key in keys:
        value = tags.get(key)
        if value:
            return value
    return None


def _normalize_type(raw: str) -> str:
    raw_lower = raw.lower()
    if "hospital" in raw_lower:
        return "hospital"
    if "clinic" in raw_lower:
        return "clinic"
    if "dentist" in raw_lower:
        return "dentist"
    if "pharmacy" in raw_lower:
        return "pharmacy"
    return "doctor"


def search_nearby(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    place_type: str = "all",
    specialty: Optional[str] = None,
) -> List[Dict]:
    radius_meters = max(500, int(radius_km * 1000))
    query = _build_overpass_query(lat, lng, radius_meters, place_type)
    logger.info(
        "search_nearby lat=%s lng=%s radius_km=%s place_type=%s specialty=%s",
        lat,
        lng,
        radius_km,
        place_type,
        specialty,
    )

    elements = _query_overpass(query, lat, lng)
    if not elements:
        logger.warning("search_nearby: Overpass returned no elements for place_type=%s", place_type)
    results = []
    seen = set()
    for element in elements:
        tags = element.get("tags", {}) or {}
        name = _extract_tag_value(tags, "name", "operator", "official_name") or "Unnamed facility"
        lat2 = element.get("lat")
        lon2 = element.get("lon")
        if lat2 is None or lon2 is None:
            center = element.get("center") or {}
            lat2 = center.get("lat")
            lon2 = center.get("lon")
        if lat2 is None or lon2 is None:
            continue

        key = (name, round(float(lat2), 5), round(float(lon2), 5))
        if key in seen:
            continue
        seen.add(key)

        distance = haversine(lat, lng, float(lat2), float(lon2))
        raw_type = _extract_tag_value(tags, "healthcare", "amenity") or "doctor"
        ftype = _normalize_type(raw_type)

        rating = None
        rating_raw = _extract_tag_value(tags, "rating", "reviews:rating", "amenity:rating")
        if rating_raw:
            try:
                rating = float(rating_raw)
            except (ValueError, TypeError):
                rating = None

        street = _extract_tag_value(tags, "addr:street", "addr:housename")
        housenumber = tags.get("addr:housenumber")
        city = _extract_tag_value(tags, "addr:city", "addr:suburb")
        address = ", ".join(p for p in [street and (f"{housenumber} " if housenumber else "") + street, city] if p)

        results.append(
            {
                "name": name,
                "type": ftype,
                "address": address or "Address not available",
                "phone": _extract_tag_value(tags, "phone", "contact:phone", "emergency:phone", "healthcare:phone"),
                "opening_hours": _extract_tag_value(tags, "opening_hours", "service_times"),
                "website": _safe_website(_extract_tag_value(tags, "website", "contact:website", "url")),
                "rating": rating,
                "lat": float(lat2),
                "lng": float(lon2),
                "distance_km": round(distance, 2),
                "is_registered": False,
            }
        )

    if specialty:
        from backend.services.specialist_service import match_specialty_keywords

        keywords = match_specialty_keywords(specialty)
        if keywords:
            results = [
                r
                for r in results
                if any(
                    kw in (r["name"] + " " + (r["address"] or "")).lower()
                    for kw in keywords
                )
            ]

    results.sort(key=lambda x: x["distance_km"])
    logger.info("search_nearby returned %d results", len(results))
    return results
