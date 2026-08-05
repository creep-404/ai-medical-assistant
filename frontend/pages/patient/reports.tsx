'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  X,
  AlertTriangle,
  Calendar,
  Eye,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Feedback';
import { medicalService } from '@/services/medical.service';

interface Report {
  id: number;
  date: string;
  disease: string;
  fileName: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Report | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await medicalService.getReports();
      setReports(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id: number) {
    setDownloading(id);
    try {
      const blob = await medicalService.downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // handle error
    } finally {
      setDownloading(null);
    }
  }

  return (
    <PatientLayout>
      <div>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-300">Documents</p>
        <h1 className="heading-display text-3xl font-semibold text-ink-900 dark:text-cream-100 mt-1">
          Medical Reports
        </h1>
        <p className="mt-1.5 text-ink-500 dark:text-cream-300/70">View and download your diagnosis reports</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-ink-900 rounded-2xl p-5 border border-cream-200 dark:border-ink-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-ink-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-cream-200 dark:bg-ink-700 rounded w-2/3" />
                  <div className="h-3 bg-cream-200 dark:bg-ink-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-cream-200 dark:bg-ink-700 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No reports yet"
            description="Use the Symptom Checker to generate your first medical report."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 card-hover h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <FileCheck2 className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 dark:text-cream-100 truncate">
                        {r.disease || 'Diagnosis Report'}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-cream-300/70 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {r.date ? new Date(r.date).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreview(r)}>
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleDownload(r.id)} disabled={downloading === r.id}>
                      {downloading === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.disease || 'Report'}
        description={preview?.date ? `Generated on ${new Date(preview.date).toLocaleDateString()}` : undefined}
      >
        <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-cream-200 dark:border-ink-700">
          <FileText className="h-16 w-16 text-ink-300 dark:text-cream-300/30 mx-auto mb-3" />
          <p className="text-ink-500 dark:text-cream-300/70">Report preview</p>
          {preview && (
            <Button className="mt-4" onClick={() => { handleDownload(preview.id); setPreview(null); }}>
              <Download className="h-4 w-4" />
              Download to View
            </Button>
          )}
        </div>
      </Modal>

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
