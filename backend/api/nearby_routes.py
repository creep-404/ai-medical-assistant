from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.auth.auth_handler import get_current_user
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


@router.post("/nearby/geocode", response_model=GeocodeResponse)
def geocode_location(
    request: GeocodeRequest,
    current_user: User = Depends(get_current_user),
):
    if not request.city or not request.city.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City name is required",
        )
    logger.info("nearby/geocode request: city=%s", request.city.strip())
    result = geocode_city(request.city.strip())
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find that location. Please try another city.",
        )
    logger.info("nearby/geocode response: %s", result)
    return result


@router.post("/nearby/search", response_model=List[NearbyPlaceResponse])
def nearby_search(
    request: NearbySearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(
        "nearby/search request: lat=%s lng=%s radius_km=%s place_type=%s specialty=%s",
        request.lat,
        request.lng,
        request.radius_km,
        request.place_type,
        request.specialty,
    )
    try:
        places = search_nearby(
            request.lat,
            request.lng,
            request.radius_km,
            request.place_type or "all",
            request.specialty,
        )
    except NearbySearchError as exc:
        logger.error("nearby/search failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Hospital/location search service unavailable: {exc}",
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("nearby/search unexpected error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Nearby search failed: {exc}",
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
            request.lat, request.lng, profile.lat, profile.lng
        )
        if distance <= request.radius_km:
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
    logger.info("nearby/search response: %d places", len(response))
    return response


@router.get("/specialist", response_model=SpecialistResponse)
def recommend_specialist(
    disease: Optional[str] = Query(None),
    symptom: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return get_specialist_for_disease(disease, [symptom] if symptom else None)
