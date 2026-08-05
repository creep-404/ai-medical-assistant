'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, ArrowLeft, Scale, Info, Activity } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Disclaimer } from '@/components/ui/Disclaimer'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-ink-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-ink-500 dark:text-cream-300/70 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
          <Logo size="sm" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-6 text-center">
              <ShieldAlert className="w-12 h-12 text-white mx-auto mb-3" />
              <h1 className="heading-display text-3xl font-bold text-white mb-2">Medical Disclaimer</h1>
              <p className="text-accent-100 text-sm">Last updated: January 2024</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-700/60 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-accent-600 dark:text-accent-300 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-2">
                      Important Notice
                    </h2>
                    <p className="text-ink-600 dark:text-cream-300/70">
                      This application is intended for <strong>educational purposes only</strong>. It is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                  </div>
                </div>
              </div>

              <Section icon={<Info className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Not a Medical Device">
                MediAssist AI is not a certified medical device nor has it been evaluated by the FDA or any other regulatory body. The predictions and recommendations provided by this system are based on machine learning models and should not be used as the sole basis for medical decisions.
              </Section>

              <Section icon={<Scale className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="No Doctor-Patient Relationship">
                Use of MediAssist AI does not establish a doctor-patient relationship. The information provided does not constitute medical advice and should not replace consultation with a qualified healthcare professional.
              </Section>

              <Section icon={<Activity className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Emergency Situations">
                If you are experiencing a medical emergency, call your local emergency services immediately (e.g., 911 in the United States). Do not rely on MediAssist AI for emergency medical assistance.
              </Section>

              <Section icon={<AlertTriangle className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Accuracy Limitations">
                While we strive for high accuracy, the AI model may produce incorrect predictions or recommendations. Factors such as incomplete symptom descriptions, rare conditions, or data limitations can affect results. Always consult a healthcare professional for proper diagnosis.
              </Section>

              <Section icon={<Info className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Data Privacy">
                We take data privacy seriously. However, for complete confidentiality, avoid sharing personally identifiable information beyond what is necessary for symptom checking. Review our Privacy Policy for more details on how your data is handled.
              </Section>

              <Section icon={<Scale className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="User Responsibility">
                By using MediAssist AI, you acknowledge and agree that:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The information provided is for informational purposes only</li>
                  <li>You will not rely solely on AI predictions for health decisions</li>
                  <li>You will seek professional medical advice for any health concerns</li>
                  <li>The developers and operators are not liable for any damages arising from use</li>
                </ul>
              </Section>
            </div>

            <div className="bg-cream-100 dark:bg-ink-900/60 px-8 py-6 border-t border-cream-200 dark:border-ink-800">
              <p className="text-sm text-ink-500 dark:text-cream-400/70 text-center">
                By continuing to use MediAssist AI, you accept this disclaimer and our{' '}
                <Link href="/terms" className="text-primary-600 dark:text-primary-300 hover:underline">Terms of Service</Link>.
                If you do not agree, please discontinue use immediately.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-2">{title}</h2>
        <div className="text-ink-600 dark:text-cream-300/70 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
