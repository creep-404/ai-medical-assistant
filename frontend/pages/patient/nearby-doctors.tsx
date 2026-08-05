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
  Layers,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';
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
    <span className="inline-flex items-center gap-0.5 text-accent-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-current' : 'opacity-30'}`} />
      ))}
      <span className="ml-1 text-xs text-ink-500 dark:text-cream-300/70">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function NearbyDoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <PatientLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Find Care</p>
            <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
              Nearby Doctors & Hospitals
            </h1>
            <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">
              Find healthcare facilities around you using OpenStreetMap
            </p>
          </div>
          <Button onClick={getCurrentLocation} disabled={locating} variant="secondary">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
            Use My Location
          </Button>
        </div>
      </motion.div>

      {urlDisease && (
        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 flex items-start gap-3">
          <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-primary-900 dark:text-primary-100 font-medium">
              Based on your predicted condition: <strong>{urlDisease}</strong>
            </p>
            {urlSpecialist && (
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Recommended specialist: <strong>{urlSpecialist}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      {location ? (
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <Navigation2 className="h-5 w-5 text-primary-600 dark:text-primary-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-cream-100">{location.label}</p>
            <p className="text-xs text-ink-400 dark:text-cream-300/60">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          </div>
          <span className="text-xs font-medium text-ink-500 dark:text-cream-300/70 bg-cream-100 dark:bg-ink-800 rounded-full px-3 py-1">
            {places.length} found
          </span>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            <h2 className="font-semibold text-ink-900 dark:text-cream-100">Where are you looking?</h2>
          </div>
          {locationError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> {locationError}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              placeholder="Enter city name, e.g. New Delhi"
              className="flex-1 input-base"
            />
            <Button onClick={handleCitySearch} disabled={citySearching || !city.trim()}>
              {citySearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search City
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      {location && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-700 dark:text-cream-200 mr-1">Type:</span>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPlaceType(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  placeType === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-700'
                )}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-700 dark:text-cream-200 mr-1">
              <Layers className="h-4 w-4 inline -mt-0.5 mr-1 text-primary-600 dark:text-primary-300" />
              Radius:
            </span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  radiusKm === r
                    ? 'bg-accent-500 text-white'
                    : 'bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-700'
                )}
              >
                {r} km
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-700 dark:text-cream-200 mr-1">Specialty:</span>
            <button
              onClick={() => setSpecialty('')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                !specialty
                  ? 'bg-primary-600 text-white'
                  : 'bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-700'
              )}
            >
              Any
            </button>
            {specialistOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(specialty === s ? '' : s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  specialty === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-ink-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Results + Map */}
      {location && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results list */}
          <div className="space-y-3">
            {searching && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-ink-900 rounded-2xl p-5 border border-cream-200 dark:border-ink-800">
                    <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!searching && searchError && places.length === 0 && (
              <Card>
                <EmptyState
                  icon={<MapPin className="h-8 w-8" />}
                  title="No results found"
                  description={searchError}
                  action={
                    <Button size="sm" variant="secondary" onClick={() => setRadiusKm(20)}>
                      Try 20 km radius
                    </Button>
                  }
                />
              </Card>
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
                    className={cn(
                      'bg-white dark:bg-ink-900 rounded-2xl p-5 border shadow-soft hover:shadow-card transition-all cursor-pointer',
                      selectedId === place.id
                        ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/40'
                        : 'border-cream-200 dark:border-ink-800'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white">
                          {place.is_registered ? (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5" />
                            </div>
                          ) : place.type === 'hospital' ? (
                            <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                          ) : place.type === 'clinic' ? (
                            <div className="w-11 h-11 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-accent-600 dark:text-accent-300" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-ink-900 dark:text-cream-100 truncate">{place.name}</h3>
                            <Badge variant="neutral">{place.type}</Badge>
                            {place.is_registered && <Badge variant="info">MediAssist</Badge>}
                          </div>
                          <p className="text-sm text-ink-500 dark:text-cream-300/70 mt-0.5 line-clamp-2">{place.address}</p>
                          {place.specialty && (
                            <p className="text-xs text-primary-600 dark:text-primary-300 font-medium mt-0.5">
                              {place.specialty}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-500 dark:text-cream-300/70">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {place.distance_km} km
                            </span>
                            {place.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {place.phone}
                              </span>
                            )}
                            {place.opening_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {place.opening_hours}
                              </span>
                            )}
                          </div>
                          {ratingStars(place.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-cream-200 dark:border-ink-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(directionsUrl(location.lat, location.lng, place.lat, place.lng), '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4" /> Directions
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(place);
                        }}
                      >
                        <Calendar className="h-4 w-4" /> Book
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-4 bg-white dark:bg-ink-900 rounded-2xl border border-cream-200 dark:border-ink-800 overflow-hidden shadow-soft h-[420px] lg:h-[calc(100vh-8rem)]">
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
        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 flex items-center gap-3">
          <Navigation2 className="h-5 w-5 text-primary-600 dark:text-primary-300 shrink-0" />
          <p className="text-sm text-primary-800 dark:text-primary-200">
            Selected: <strong>{selectedPlace.name}</strong>
            {selectedPlace.phone ? ` · ${selectedPlace.phone}` : ''} · {selectedPlace.distance_km} km away
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          Facility information is sourced from OpenStreetMap and may be incomplete. This application is intended
          for educational purposes only and does not replace professional medical advice. In an emergency, call
          your local emergency number immediately.
        </p>
      </div>
    </PatientLayout>
  );
}
