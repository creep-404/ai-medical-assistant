'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  DownloadCloud,
  AlertTriangle,
  Calendar,
  Thermometer,
  Loader2,
} from 'lucide-react';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientHeader from '@/components/patient/PatientHeader';
import { medicalService } from '@/services/medical.service';

interface Diagnosis {
  id: number;
  date: string;
  symptoms: string[];
  predictedDisease: string;
  confidence: number;
  details?: any;
}

export default function HistoryPage() {
  const [isDark, setIsDark] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await medicalService.getPredictionHistory();
      const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      const normalized = raw.map((d: any) => {
        let symptoms: string[] = d.symptoms;
        if (typeof d.symptoms === 'string') {
          symptoms = d.symptoms.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (!Array.isArray(symptoms)) {
          symptoms = [];
        }
        return { ...d, symptoms };
      });
      setDiagnoses(normalized);
    } catch (err: any) {
      console.error('[history] load error:', err?.message || err);
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this diagnosis record?')) return;
    try {
      await medicalService.deletePrediction(id);
      setDiagnoses((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // handle error
    }
  }

  async function handleDownload(id: number) {
    try {
      const res = await medicalService.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // handle error
    }
  }

  async function handleExportCSV() {
    try {
      const rows = diagnoses.map(d => `${d.id},${d.date},"${d.symptoms.join(';')}",${d.predictedDisease},${d.confidence}`);
      const csv = 'ID,Date,Symptoms,Disease,Confidence\n' + rows.join('\n');
      const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagnosis-history.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  }

  const filtered = useMemo(() => {
    let result = [...diagnoses];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.predictedDisease?.toLowerCase().includes(q) ||
          d.symptoms?.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (dateFrom) result = result.filter((d) => new Date(d.date) >= new Date(dateFrom));
    if (dateTo) result = result.filter((d) => new Date(d.date) <= new Date(dateTo));
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [diagnoses, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function confidenceColor(score: number) {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <PatientHeader onToggleDark={() => setIsDark(!isDark)} isDark={isDark} />

      <main className="lg:pl-72">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diagnosis History</h1>
              <p className="text-gray-500 mt-1">View all your past symptom checks and predictions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              disabled={diagnoses.length === 0}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search symptoms or disease..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No records found</h3>
              <p className="text-gray-500">
                {diagnoses.length === 0
                  ? 'You have no diagnosis history yet. Use the Symptom Checker to get started.'
                  : 'No records match your search criteria.'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-3">Symptoms</div>
                  <div className="col-span-2">Disease</div>
                  <div className="col-span-1">Confidence</div>
                  <div className="col-span-4">Actions</div>
                </div>
                <AnimatePresence>
                  {paginated.map((d) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      className="border-b border-gray-50 last:border-0"
                    >
                      <div
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                      >
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 md:hidden" />
                            <span className="text-sm text-gray-900">{d.date ? new Date(d.date).toLocaleDateString() : '--'}</span>
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <div className="flex flex-wrap gap-1">
                            {d.symptoms?.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {s}
                              </span>
                            ))}
                            {(d.symptoms?.length || 0) > 3 && (
                              <span className="text-xs text-gray-400">+{d.symptoms!.length - 3}</span>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-sm font-medium text-gray-900">{d.predictedDisease || '--'}</span>
                        </div>
                        <div className="md:col-span-1">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confidenceColor(d.confidence)}`}
                          >
                            {d.confidence ? `${Math.round(d.confidence)}%` : '--'}
                          </span>
                        </div>
                        <div className="md:col-span-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownload(d.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300 ml-auto">
                              {expandedId === d.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === d.id && d.details && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(d.details, null, 2)}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
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
