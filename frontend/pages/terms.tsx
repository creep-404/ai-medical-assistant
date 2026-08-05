'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, Scale, Info, FileText, Lock, AlertTriangle, UserCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Disclaimer } from '@/components/ui/Disclaimer'

export default function TermsPage() {
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
            <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-6 text-center">
              <FileText className="w-12 h-12 text-white mx-auto mb-3" />
              <h1 className="heading-display text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
              <p className="text-primary-100 text-sm">Last updated: January 2024</p>
            </div>

            <div className="p-8 space-y-8">
              <Section icon={<UserCheck className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Acceptance of Terms">
                By accessing or using MediAssist AI, you agree to be bound by these Terms and Conditions, our Medical Disclaimer, and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the application.
              </Section>

              <Section icon={<Info className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Use of Service">
                MediAssist AI provides AI-powered symptom checking, disease prediction, and health information for educational purposes. You agree to use the service for lawful purposes only and not to misuse the application or attempt to disrupt its operation.
              </Section>

              <Section icon={<AlertTriangle className="w-6 h-6 text-accent-600 dark:text-accent-300" />} title="Educational Purpose Only">
                The information provided by MediAssist AI is for educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
              </Section>

              <Section icon={<Lock className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Account Responsibilities">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating an account.
              </Section>

              <Section icon={<Scale className="w-6 h-6 text-primary-600 dark:text-primary-300" />} title="Limitation of Liability">
                The developers and operators of MediAssist AI shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from the use or inability to use the service, including reliance on AI-generated predictions.
              </Section>

              <Section icon={<ShieldAlert className="w-6 h-6 text-accent-600 dark:text-accent-300" />} title="Emergency Situations">
                In case of a medical emergency, do not use MediAssist AI. Call your local emergency services immediately (e.g., 911 in the United States).
              </Section>
            </div>

            <div className="bg-cream-100 dark:bg-ink-900/60 px-8 py-6 border-t border-cream-200 dark:border-ink-800">
              <p className="text-sm text-ink-500 dark:text-cream-400/70 text-center">
                Please also review our{' '}
                <Link href="/disclaimer" className="text-primary-600 dark:text-primary-300 hover:underline">Medical Disclaimer</Link>.
                If you do not agree to these terms, please discontinue use immediately.
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
