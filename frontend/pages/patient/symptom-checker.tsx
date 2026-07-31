'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { medicalService } from '@/services/medical.service';

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
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [categories, setCategories] = useState(symptomCategories);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900">Symptom Checker</h1>
            <p className="text-gray-500 mt-1">Select your symptoms to get a possible diagnosis</p>
          </motion.div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Selected Symptoms */}
          <AnimatePresence>
            {selectedSymptoms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2"
              >
                {selectedSymptoms.map((s) => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {s}
                    <button onClick={() => toggleSymptom(s)} className="hover:bg-blue-100 rounded-full p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                ))}
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.symptoms.map((symptom) => (
                    <motion.button
                      key={symptom}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckSymptoms}
              disabled={selectedSymptoms.length === 0 || predicting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {predicting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Check Symptoms
                </>
              )}
            </motion.button>
            {selectedSymptoms.length > 0 && (
              <span className="text-sm text-gray-500">{selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected</span>
            )}
          </div>

          {/* Emergency Alert */}
          <AnimatePresence>
            {showEmergency && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              >
                <motion.div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-red-700 text-center mb-2">⚠ Emergency Detected</h2>
                  <p className="text-gray-700 text-center leading-relaxed mb-6">
                    Your symptoms may indicate a serious medical condition. Please visit the nearest hospital or consult a
                    licensed doctor immediately.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowEmergency(false); handleReset(); }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear & Start Over
                    </button>
                    <button
                      onClick={() => setShowEmergency(false)}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      I Understand
                    </button>
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Predicted Condition</p>
                      <h2 className="text-2xl font-bold text-gray-900">{result.disease || result.predictedDisease}</h2>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                      <span className="text-sm font-bold text-blue-700">{Math.round(result.confidence || 0)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence || 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          (result.confidence || 0) >= 80
                            ? 'bg-green-500'
                            : (result.confidence || 0) >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {result.possibleCauses && (
                    <Section icon={AlertTriangle} title="Possible Causes">
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {result.possibleCauses.map((c: string, i: number) => <li key={i}>{c}</li>)}
                      </ul>
                    </Section>
                  )}

                  {result.medicines && (
                    <Section icon={Pill} title="Recommended OTC Medicines">
                      <div className="space-y-2">
                        {result.medicines.map((m: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                            <span className="font-medium text-gray-900">{m.name}</span>
                            <span className="text-sm text-gray-500">{m.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {result.homeRemedies && (
                    <Section icon={Heart} title="Home Remedies">
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {result.homeRemedies.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </Section>
                  )}

                  {result.dietSuggestions && (
                    <Section icon={Apple} title="Diet Suggestions">
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {result.dietSuggestions.map((d: string, i: number) => <li key={i}>{d}</li>)}
                      </ul>
                    </Section>
                  )}

                  {result.hydrationAdvice && (
                    <Section icon={Droplets} title="Hydration Advice">
                      <p className="text-sm text-gray-700">{result.hydrationAdvice}</p>
                    </Section>
                  )}

                  {result.recoveryTime && (
                    <Section icon={Bed} title="Recovery Time">
                      <p className="text-sm text-gray-700">{result.recoveryTime}</p>
                    </Section>
                  )}

                  {result.precautions && (
                    <Section icon={Shield} title="Precautions">
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {result.precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </Section>
                  )}

                  {result.whenToVisitDoctor && (
                    <Section icon={Thermometer} title="When to Visit Doctor">
                      <p className="text-sm text-gray-700">{result.whenToVisitDoctor}</p>
                    </Section>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadReport}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/patient/appointments"
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {result?.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
              {result.error}
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              This application is intended for educational purposes only. It does not replace professional medical
              advice, diagnosis, or treatment. Always consult a licensed healthcare provider for serious medical
              conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
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
        <Icon className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
