from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
from backend.auth.rate_limiter import make_nearby_limiter, client_ip
from backend.database.database import get_db
from backend.models.user import DoctorProfile, User, UserRole
from backend.schemas.medical import (
    GeocodeRequest,
    GeocodeResponse,
    NearbyPlaceResponse,
    NearbySearchRequest,
    SpecialistResponse,
)
from backend.services.nearby_service import (
    NearbySearchError,
    geocode_city,
    haversine,
    search_nearby,
)
from backend.services.specialist_service import get_specialist_for_disease

import logging

logger = logging.getLogger("nearby_routes")

router = APIRouter()

_nearby_limiter = None


def _get_nearby_limiter():
    global _nearby_limiter
    if _nearby_limiter is None:
        _nearby_limiter = make_nearby_limiter()
    return _nearby_limiter


@router.post("/nearby/geocode", response_model=GeocodeResponse)
def geocode_location(
    request: Request,
    geocode_data: GeocodeRequest,
    current_user: User = Depends(get_current_user),
):
    _get_nearby_limiter().check(client_ip(request))
    if not geocode_data.city or not geocode_data.city.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City name is required",
        )
    result = geocode_city(geocode_data.city.strip())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find that location. Please try another city.",
        )
    return result


@router.post("/nearby/search", response_model=List[NearbyPlaceResponse])
def nearby_search(
    request: Request,
    search_data: NearbySearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_nearby_limiter().check(client_ip(request))
    try:
        places = search_nearby(
            search_data.lat,
            search_data.lng,
            search_data.radius_km,
            search_data.place_type or "all",
            search_data.specialty,
        )
    except NearbySearchError as exc:
        logger.error("nearby/search failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Hospital/location search service is temporarily unavailable",
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("nearby/search unexpected error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nearby search service is temporarily unavailable",
        )

    registered_doctors = (
        db.query(DoctorProfile)
        .join(User)
        .filter(
            User.is_active == True,
            User.role == UserRole.doctor,
            DoctorProfile.lat.isnot(None),
            DoctorProfile.lng.isnot(None),
        )
        .all()
    )

    for profile in registered_doctors:
        distance = haversine(
            search_data.lat, search_data.lng, profile.lat, profile.lng
        )
        if distance <= search_data.radius_km:
            places.append(
                {
                    "name": profile.user.full_name,
                    "type": "doctor",
                    "address": profile.hospital_name or "Private practice",
                    "phone": None,
                    "opening_hours": profile.available_days,
                    "website": None,
                    "rating": profile.rating,
                    "lat": profile.lat,
                    "lng": profile.lng,
                    "distance_km": round(distance, 2),
                    "is_registered": True,
                    "doctor_id": profile.user_id,
                    "specialty": profile.specialty,
                    "hospital": profile.hospital_name,
                }
            )

    places.sort(key=lambda x: x["distance_km"])
    response = places[:50]
    return response


@router.get("/specialist", response_model=SpecialistResponse)
def recommend_specialist(
    disease: Optional[str] = Query(None),
    symptom: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return get_specialist_for_disease(disease, [symptom] if symptom else None)
