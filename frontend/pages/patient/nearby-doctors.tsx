'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Locate,
  Search,
  Loader2,
  Building2,
  Clock,
  Phone,
  Star,
  Navigation,
  Calendar,
  Stethoscope,
  AlertTriangle,
  Navigation2,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { nearbyService } from '@/services/nearby.service';
import toast from 'react-hot-toast';

const NearbyMap = dynamic(() => import('@/components/patient/NearbyMap'), { ssr: false });

interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  opening_hours?: string;
  website?: string;
  rating?: number | null;
  lat: number;
  lng: number;
  distance_km: number;
  is_registered?: boolean;
  doctor_id?: number | null;
  specialty?: string;
  hospital?: string;
}

const RADIUS_OPTIONS = [2, 5, 10, 20];
const TYPE_OPTIONS = [
  { value: 'all', label: 'All', icon: MapPin },
  { value: 'hospital', label: 'Hospitals', icon: Building2 },
  { value: 'clinic', label: 'Clinics', icon: Building2 },
  { value: 'doctor', label: 'Doctors', icon: Stethoscope },
];

function directionsUrl(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  return `https://www.openstreetmap.org/directions?from=${fromLat},${fromLng}&to=${toLat},${toLng}`;
}

function ratingStars(rating?: number | null) {
  if (!rating) return null;
  const stars = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'opacity-30'}`} />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function NearbyDoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDark, setIsDark] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [citySearching, setCitySearching] = useState(false);

  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [radiusKm, setRadiusKm] = useState(5);
  const [placeType, setPlaceType] = useState('all');
  const [specialty, setSpecialty] = useState('');

  const urlDisease = searchParams.get('disease') || '';
  const urlSpecialist = searchParams.get('specialist') || '';

  const specialistOptions = useMemo(
    () => [
      'General Physician',
      'Neurologist',
      'Cardiologist',
      'Dermatologist',
      'Ophthalmologist',
      'Pulmonologist',
      'Gastroenterologist',
      'Orthopedist',
      'ENT Specialist',
      'Endocrinologist',
    ],
    []
  );

  useEffect(() => {
    if (urlSpecialist) setSpecialty(urlSpecialist);
  }, [urlSpecialist]);

  function getCurrentLocation() {
    setLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError('Geolocation is not supported by this browser. Please enter your city instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your current location' });
        toast.success('Location detected');
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. Enter your city instead.'
            : 'Unable to get your location. Enter your city instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCitySearch() {
    if (!city.trim()) return;
    setCitySearching(true);
    setLocationError(null);
    try {
      const geo = await nearbyService.geocodeCity(city.trim());
      setLocation({ lat: geo.lat, lng: geo.lng, label: geo.display_name || city.trim() });
      setSearchError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Could not find that location. Try another city.';
      setSearchError(msg);
      toast.error(msg);
    } finally {
      setCitySearching(false);
    }
  }

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setSearching(true);
    setSearchError(null);
    nearbyService
      .searchNearby({
        lat: location.lat,
        lng: location.lng,
        radius_km: radiusKm,
        place_type: placeType,
        specialty: specialty || undefined,
      })
      .then((data: any[]) => {
        if (cancelled) return;
        const mapped: NearbyPlace[] = (Array.isArray(data) ? data : []).map((p, i) => ({
          id: p.doctor_id ? `doc-${p.doctor_id}` : `osm-${i}-${p.lat}-${p.lng}`,
          name: p.name,
          type: p.type,
          address: p.address,
          phone: p.phone,
          opening_hours: p.opening_hours,
          website: p.website,
          rating: p.rating,
          lat: p.lat,
          lng: p.lng,
          distance_km: p.distance_km,
          is_registered: p.is_registered,
          doctor_id: p.doctor_id,
          specialty: p.specialty,
          hospital: p.hospital,
        }));
        setPlaces(mapped);
        setSelectedId(null);
        if (mapped.length === 0) setSearchError('No results found in this area. Try a larger radius.');
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.detail || 'Failed to search nearby facilities.';
        setSearchError(msg);
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location, radiusKm, placeType, specialty]);

  function handleBook(place: NearbyPlace) {
    const params = new URLSearchParams();
    if (place.is_registered && place.doctor_id) {
      params.set('doctor_id', String(place.doctor_id));
      params.set('clinic', place.hospital || '');
      if (place.specialty) params.set('specialty', place.specialty);
    } else {
      params.set('clinic', place.name);
      params.set('address', place.address || '');
    }
    router.push(`/patient/book-appointment?${params.toString()}`);
  }

  const selectedPlace = places.find((p) => p.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nearby Doctors & Hospitals</h1>
                <p className="text-gray-500 mt-1">Find healthcare facilities around you using OpenStreetMap</p>
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={locating}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                Use My Location
              </button>
            </div>
          </motion.div>

          {urlDisease && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">
                  Based on your predicted condition: <strong>{urlDisease}</strong>
                </p>
                {urlSpecialist && (
                  <p className="text-sm text-blue-700">
                    Recommended specialist: <strong>{urlSpecialist}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {location ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Navigation2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{location.label}</p>
                <p className="text-xs text-gray-500">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                {places.length} found
              </span>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Where are you looking?</h2>
              </div>
              {locationError && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {locationError}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                  placeholder="Enter city name, e.g. New Delhi"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCitySearch}
                  disabled={citySearching || !city.trim()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {citySearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search City
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          {location && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-1">Type:</span>
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPlaceType(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      placeType === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-1">Radius:</span>
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusKm(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      radiusKm === r
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-1">Specialty:</span>
                <button
                  onClick={() => setSpecialty('')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !specialty ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Any
                </button>
                {specialistOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecialty(specialty === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      specialty === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results + Map */}
          {location && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Results list */}
              <div className="space-y-3">
                {searching && (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                )}

                {!searching && searchError && places.length === 0 && (
                  <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
                    <MapPin className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">{searchError}</p>
                    <button
                      onClick={() => setRadiusKm(20)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
                    >
                      Try 20 km radius
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {!searching &&
                    places.map((place, i) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedId(place.id)}
                        className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          selectedId === place.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white">
                              {place.is_registered ? (
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <Stethoscope className="w-5 h-5" />
                                </div>
                              ) : place.type === 'hospital' ? (
                                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-red-600" />
                                </div>
                              ) : place.type === 'clinic' ? (
                                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-amber-600" />
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
                                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                  {place.type}
                                </span>
                                {place.is_registered && (
                                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    MediAssist
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{place.address}</p>
                              {place.specialty && (
                                <p className="text-xs text-blue-600 font-medium mt-0.5">{place.specialty}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" /> {place.distance_km} km
                                </span>
                                {place.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" /> {place.phone}
                                  </span>
                                )}
                                {place.opening_hours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {place.opening_hours}
                                  </span>
                                )}
                              </div>
                              {ratingStars(place.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(directionsUrl(location.lat, location.lng, place.lat, place.lng), '_blank');
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-4 h-4" /> Directions
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBook(place);
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-4 h-4" /> Book
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Map */}
              <div className="lg:sticky lg:top-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[420px] lg:h-[calc(100vh-8rem)]">
                <NearbyMap
                  center={{ lat: location.lat, lng: location.lng }}
                  places={places}
                  selectedId={selectedId}
                  onSelect={(p) => setSelectedId(p.id)}
                />
              </div>
            </div>
          )}

          {selectedPlace && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <Navigation2 className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-800">
                Selected: <strong>{selectedPlace.name}</strong>
                {selectedPlace.phone ? ` · ${selectedPlace.phone}` : ''} · {selectedPlace.distance_km} km away
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Facility information is sourced from OpenStreetMap and may be incomplete. This application is intended
              for educational purposes only and does not replace professional medical advice. In an emergency, call
              your local emergency number immediately.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
