'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  X,
  AlertTriangle,
  Activity,
  Droplets,
  Apple,
  Bed,
  Shield,
  Stethoscope,
  Download,
  Calendar,
  Loader2,
  Pill,
  Thermometer,
  Heart,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { medicalService } from '@/services/medical.service';
import { nearbyService } from '@/services/nearby.service';

const symptomCategories = [
  {
    name: 'General',
    symptoms: ['Fever', 'Fatigue', 'Weight Loss', 'Night Sweats', 'Chills', 'Weakness'],
  },
  {
    name: 'Respiratory',
    symptoms: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Runny Nose', 'Sneezing', 'Chest Congestion'],
  },
  {
    name: 'Digestive',
    symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Bloating', 'Heartburn'],
  },
  {
    name: 'Pain',
    symptoms: ['Headache', 'Body Ache', 'Abdominal Pain', 'Chest Pain', 'Joint Pain', 'Back Pain'],
  },
  {
    name: 'Skin',
    symptoms: ['Rash', 'Itching', 'Redness', 'Swelling', 'Dry Skin', 'Hives'],
  },
  {
    name: 'Other',
    symptoms: ['Dizziness', 'Blurred Vision', 'Insomnia', 'Anxiety', 'Numbness', 'Dehydration'],
  },
];

const allSymptoms = symptomCategories.flatMap((c) => c.symptoms);

export default function SymptomCheckerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyHospitals, setEmergencyHospitals] = useState<any[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [categories, setCategories] = useState(symptomCategories);

  const emergencyContacts = [
    { name: 'Emergency Services', number: '112' },
    { name: 'Ambulance', number: '108' },
    { name: 'Police', number: '100' },
    { name: 'National Poison Control', number: '011-26589391' },
  ];

  useEffect(() => {
    let cancelled = false;
    medicalService
      .getSymptoms()
      .then((data: { name: string }[]) => {
        if (cancelled || !Array.isArray(data)) return;
        const backendNames = data.map((s) => s.name).filter(Boolean);
        const knownInCategory = symptomCategories.map((cat) => ({
          ...cat,
          symptoms: cat.symptoms.filter((s) => backendNames.includes(s)),
        }));
        const used = new Set(knownInCategory.flatMap((cat) => cat.symptoms));
        const leftovers = backendNames.filter((s) => !used.has(s));
        const rebuilt = [...knownInCategory.filter((cat) => cat.symptoms.length > 0)];
        if (leftovers.length > 0) {
          rebuilt.push({ name: 'Other', symptoms: leftovers });
        }
        if (rebuilt.length > 0) setCategories(rebuilt);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        symptoms: cat.symptoms.filter((s) => s.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.symptoms.length > 0);
  }, [searchQuery, categories]);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleCheckSymptoms() {
    if (selectedSymptoms.length === 0) return;

    setPredicting(true);
    setResult(null);
    setShowEmergency(false);
    try {
      const res = await medicalService.predictDisease(selectedSymptoms);

      if (res.is_emergency) {
        setShowEmergency(true);
        findNearestHospitals();
        return;
      }

      setResult({
        id: res.id,
        disease: res.predicted_disease,
        predictedDisease: res.predicted_disease,
        confidence: res.confidence != null ? Math.round(res.confidence * 100) : 0,
        possibleCauses: res.causes || [],
        medicines: res.medicines || [],
        homeRemedies: res.home_remedies || [],
        dietSuggestions: res.diet_suggestions || [],
        hydrationAdvice: res.hydration_advice,
        recoveryTime: res.recovery_time,
        precautions: res.precautions || [],
        whenToVisitDoctor: res.when_to_see_doctor,
        specialist: res.recommended_specialist,
        topPredictions: res.top_predictions || [],
      });
    } catch {
      setResult({ error: 'Failed to get prediction. Please try again.' });
    } finally {
      setPredicting(false);
    }
  }

  async function handleDownloadReport() {
    if (!result) return;
    try {
      const res = await medicalService.generateReport(result.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-report-${result.id || Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  }

  function handleReset() {
    setSelectedSymptoms([]);
    setResult(null);
    setSearchQuery('');
  }

  async function findNearestHospitals() {
    setLoadingHospitals(true);
    setEmergencyHospitals([]);
    setHospitalError(null);
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr: any) {
          console.warn('[emergency] geolocation failed:', geoErr?.message || geoErr?.code || geoErr);
          lat = null;
        }
      }
      if (lat == null || lng == null) {
        const city = window.prompt('We could not detect your location. Enter your city to find nearest hospitals:');
        if (!city) return;
        const geo = await nearbyService.geocodeCity(city);
        lat = geo?.lat ?? null;
        lng = geo?.lng ?? null;
      }
      if (lat == null || lng == null) {
        setHospitalError('Could not determine your location. Please enable location access or try again.');
        return;
      }
      const res = await nearbyService.searchNearby({ lat, lng, radius_km: 20, place_type: 'hospital' });
      const places = Array.isArray(res) ? res : Array.isArray(res?.places) ? res.places : [];
      if (!Array.isArray(places)) {
        setHospitalError('Hospital lookup returned an unexpected format (expected an array). Please retry.');
        return;
      }
      const hospitals = places.filter((p: any) => p.type === 'hospital').slice(0, 5);
      setEmergencyHospitals(hospitals);
      if (hospitals.length === 0) {
        setHospitalError(`No hospitals found within 20 km. Raw response had ${places.length} result(s).`);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || String(err);
      console.error('[emergency] hospital lookup error:', detail);
      setHospitalError(detail);
    } finally {
      setLoadingHospitals(false);
    }
  }

  return (
    <PatientLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-300">AI Analysis</p>
        <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
          Symptom Checker
        </h1>
        <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">
          Select your symptoms to get a possible diagnosis
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 dark:text-cream-300/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symptoms..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-800 rounded-xl text-sm text-ink-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-transparent shadow-soft"
        />
      </div>

      {/* Selected Symptoms */}
      <AnimatePresence>
        {selectedSymptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2"
          >
            {selectedSymptoms.map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800"
              >
                {s}
                <button onClick={() => toggleSymptom(s)} className="hover:bg-primary-100 dark:hover:bg-primary-900/60 rounded-full p-0.5 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.span>
            ))}
            <button
              onClick={() => setSelectedSymptoms([])}
              className="px-3 py-1.5 text-sm text-ink-400 dark:text-cream-300/60 hover:text-ink-700 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-ink-800 rounded-full transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Symptom Grid */}
      <div className="space-y-6">
        {(searchQuery ? filteredCategories : categories).map((category) => (
          <div key={category.name}>
            <h3 className="text-sm font-semibold text-ink-400 dark:text-cream-300/60 uppercase tracking-wider mb-3">
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.symptoms.map((symptom) => (
                <motion.button
                  key={symptom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSymptom(symptom)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    selectedSymptoms.includes(symptom)
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-cream-200 border-cream-200 dark:border-ink-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                  )}
                >
                  {symptom}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Check Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleCheckSymptoms}
          disabled={selectedSymptoms.length === 0}
          loading={predicting}
          size="lg"
        >
          {predicting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Check Symptoms
            </>
          )}
        </Button>
        {selectedSymptoms.length > 0 && (
          <span className="text-sm text-ink-400 dark:text-cream-300/60">
            {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Emergency Alert */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm"
          >
            <motion.div className="bg-white dark:bg-ink-900 rounded-2xl max-w-lg w-full p-6 shadow-lift border border-red-200 dark:border-red-900 max-h-[90vh] overflow-y-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 text-center mb-2">
                ⚠ Emergency Detected
              </h2>
              <p className="text-ink-600 dark:text-cream-300 text-center leading-relaxed mb-6">
                Your symptoms may indicate a serious medical condition. Please visit the nearest hospital or consult a
                licensed doctor immediately.
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-red-600" /> Nearest Hospitals
                </h3>
                {loadingHospitals ? (
                  <div className="flex items-center justify-center py-4 text-ink-500 dark:text-cream-300/70 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Locating hospitals...
                  </div>
                ) : emergencyHospitals.length > 0 ? (
                  <div className="space-y-2">
                    {emergencyHospitals.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="block p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink-900 dark:text-cream-100">{h.name}</p>
                          <span className="text-xs font-medium text-red-700 dark:text-red-300 shrink-0">
                            {h.distance_km != null ? `${h.distance_km} km` : 'Distance unknown'}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 dark:text-cream-300/70 mt-0.5 line-clamp-1">
                          {h.address && h.address !== 'Address not available' ? h.address : 'Address unavailable'}
                          {h.lat != null && h.lng != null ? ` (${h.lat.toFixed(4)}, ${h.lng.toFixed(4)})` : ''}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          {h.phone ? (
                            <a href={`tel:${String(h.phone).replace(/[^0-9+]/g, '')}`} className="text-xs text-primary-700 dark:text-primary-300 font-medium hover:underline">
                              📞 {h.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-ink-400 dark:text-cream-300/50">Phone unavailable</span>
                          )}
                          {h.website && (
                            <a href={h.website} target="_blank" rel="noreferrer" className="text-xs text-primary-700 dark:text-primary-300 font-medium hover:underline">
                              Visit Website ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-3">
                    {hospitalError ? (
                      <p className="text-sm text-red-600 dark:text-red-400">{hospitalError}</p>
                    ) : (
                      <p className="text-sm text-ink-500 dark:text-cream-300/70">
                        Hospital list unavailable. Call Emergency Services immediately.
                      </p>
                    )}
                    <button
                      onClick={findNearestHospitals}
                      className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Loader2 className={`h-4 w-4 ${loadingHospitals ? 'animate-spin' : 'hidden'}`} />
                      Retry Search
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100 mb-2">Emergency Contacts</h3>
                <div className="space-y-2">
                  {emergencyContacts.map((c) => (
                    <a
                      key={c.name}
                      href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center justify-between p-3 bg-cream-100 dark:bg-ink-800 rounded-xl hover:bg-cream-200 dark:hover:bg-ink-700 transition-colors"
                    >
                      <span className="text-sm text-ink-700 dark:text-cream-200">{c.name}</span>
                      <span className="text-sm font-bold text-red-700 dark:text-red-400">{c.number}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowEmergency(false); handleReset(); }}
                >
                  Clear & Start Over
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => setShowEmergency(false)}>
                  I Understand
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {result && !result.error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-cream-200 dark:border-ink-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div>
                    <p className="text-sm text-ink-400 dark:text-cream-300/60">Predicted Condition</p>
                    <h2 className="text-2xl font-bold text-ink-900 dark:text-cream-100">
                      {result.disease || result.predictedDisease}
                    </h2>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink-700 dark:text-cream-200">Confidence Score</span>
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                      {Math.round(result.confidence || 0)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-cream-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        (result.confidence || 0) >= 80
                          ? 'bg-secondary-500'
                          : (result.confidence || 0) >= 50
                          ? 'bg-accent-500'
                          : 'bg-red-500'
                      )}
                    />
                  </div>
                </div>

                {result.specialist && (
                  <div className="flex items-center justify-between gap-3 p-3 bg-secondary-50 dark:bg-secondary-900/30 border border-secondary-200 dark:border-secondary-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-secondary-600 dark:text-secondary-300" />
                      <span className="text-sm font-medium text-secondary-800 dark:text-secondary-200">
                        Recommended Specialist
                      </span>
                    </div>
                    <span className="text-sm font-bold text-secondary-700 dark:text-secondary-300">{result.specialist}</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {result.possibleCauses && (
                  <Section icon={AlertTriangle} title="Possible Causes">
                    <ul className="list-disc list-inside text-sm text-ink-700 dark:text-cream-200 space-y-1">
                      {result.possibleCauses.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </Section>
                )}

                {result.medicines && (
                  <Section icon={Pill} title="Recommended OTC Medicines">
                    <div className="space-y-2">
                      {result.medicines.map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                          <span className="font-medium text-ink-900 dark:text-cream-100">{m.name}</span>
                          <span className="text-sm text-ink-500 dark:text-cream-300/70">{m.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {result.homeRemedies && (
                  <Section icon={Heart} title="Home Remedies">
                    <ul className="list-disc list-inside text-sm text-ink-700 dark:text-cream-200 space-y-1">
                      {result.homeRemedies.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </Section>
                )}

                {result.dietSuggestions && (
                  <Section icon={Apple} title="Diet Suggestions">
                    <ul className="list-disc list-inside text-sm text-ink-700 dark:text-cream-200 space-y-1">
                      {result.dietSuggestions.map((d: string, i: number) => <li key={i}>{d}</li>)}
                    </ul>
                  </Section>
                )}

                {result.hydrationAdvice && (
                  <Section icon={Droplets} title="Hydration Advice">
                    <p className="text-sm text-ink-700 dark:text-cream-200">{result.hydrationAdvice}</p>
                  </Section>
                )}

                {result.recoveryTime && (
                  <Section icon={Bed} title="Recovery Time">
                    <p className="text-sm text-ink-700 dark:text-cream-200">{result.recoveryTime}</p>
                  </Section>
                )}

                {result.precautions && (
                  <Section icon={Shield} title="Precautions">
                    <ul className="list-disc list-inside text-sm text-ink-700 dark:text-cream-200 space-y-1">
                      {result.precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  </Section>
                )}

                {result.whenToVisitDoctor && (
                  <Section icon={Thermometer} title="When to Visit Doctor">
                    <p className="text-sm text-ink-700 dark:text-cream-200">{result.whenToVisitDoctor}</p>
                  </Section>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex flex-wrap gap-3">
                <Button onClick={handleDownloadReport}>
                  <Download className="h-4 w-4" />
                  Generate Report
                </Button>
                <Link
                  href={`/patient/nearby-doctors?disease=${encodeURIComponent(result.disease || '')}&specialist=${encodeURIComponent(result.specialist || '')}`}
                >
                  <Button variant="secondary">
                    <MapPin className="h-4 w-4" />
                    Find Nearby Doctors
                  </Button>
                </Link>
                <Link href="/patient/appointments">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {result?.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-300 text-sm">
          {result.error}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent-600 dark:text-accent-300 shrink-0 mt-0.5" />
        <p className="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
          This application is intended for educational purposes only. It does not replace professional medical
          advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
          conditions.
        </p>
      </div>
    </PatientLayout>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-300" />
        <h3 className="font-semibold text-ink-900 dark:text-cream-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}
