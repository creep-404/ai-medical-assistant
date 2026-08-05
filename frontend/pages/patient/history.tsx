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
  FileSearch,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';
import { medicalService } from '@/services/medical.service';

interface Diagnosis {
  id: number;
  date: string;
  symptoms: string[];
  predictedDisease: string;
  confidence: number;
  details?: any;
}

function confidenceBadge(score: number) {
  if (score >= 80) return <Badge variant="success">{Math.round(score)}%</Badge>;
  if (score >= 50) return <Badge variant="warning">{Math.round(score)}%</Badge>;
  return <Badge variant="danger">{Math.round(score)}%</Badge>;
}

export default function HistoryPage() {
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

  return (
    <PatientLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Records</p>
          <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
            Diagnosis History
          </h1>
          <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">
            View all your past symptom checks and predictions
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={diagnoses.length === 0}>
          <DownloadCloud className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search symptoms or disease..."
              className="w-full pl-10 pr-4 py-2.5 input-base"
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 input-base"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 input-base"
            placeholder="To"
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-ink-900 rounded-2xl p-5 border border-cream-200 dark:border-ink-800">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-1/4" />
                  <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/3" />
                </div>
                <div className="h-6 bg-cream-200 dark:bg-ink-700 rounded-full w-16" />
                <div className="h-8 bg-cream-200 dark:bg-ink-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileSearch className="h-8 w-8" />}
            title="No records found"
            description={
              diagnoses.length === 0
                ? 'You have no diagnosis history yet. Use the Symptom Checker to get started.'
                : 'No records match your search criteria.'
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-cream-100 dark:bg-ink-800/60 border-b border-cream-200 dark:border-ink-800 text-xs font-semibold text-ink-500 dark:text-cream-300/70 uppercase tracking-wider">
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
                  className="border-b border-cream-100 dark:border-ink-800/60 last:border-0"
                >
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-cream-100/70 dark:hover:bg-ink-800/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  >
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-ink-400 dark:text-cream-300/50 md:hidden" />
                        <span className="text-sm text-ink-900 dark:text-cream-100">
                          {d.date ? new Date(d.date).toLocaleDateString() : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex flex-wrap gap-1">
                        {d.symptoms?.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-xs bg-cream-100 dark:bg-ink-800 text-ink-600 dark:text-cream-300 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                        {(d.symptoms?.length || 0) > 3 && (
                          <span className="text-xs text-ink-400 dark:text-cream-300/50">+{d.symptoms!.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-ink-900 dark:text-cream-100">
                        {d.predictedDisease || '--'}
                      </span>
                    </div>
                    <div className="md:col-span-1">
                      {d.confidence ? confidenceBadge(d.confidence) : <Badge variant="neutral">--</Badge>}
                    </div>
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDownload(d.id)}
                          className="p-2 text-ink-400 dark:text-cream-300/50 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Download report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-ink-400 dark:text-cream-300/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-ink-300 dark:text-cream-300/30 ml-auto">
                          {expandedId === d.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
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
                        <div className="px-6 pb-4 pt-2 border-t border-cream-100 dark:border-ink-800 bg-cream-100/50 dark:bg-ink-800/40">
                          <pre className="text-sm text-ink-700 dark:text-cream-200 whitespace-pre-wrap">
                            {JSON.stringify(d.details, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                    page === p
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800 border border-cream-200 dark:border-ink-800'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
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
