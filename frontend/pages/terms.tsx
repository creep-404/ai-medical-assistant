'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, Scale, Info, FileText, Lock, AlertTriangle, UserCheck } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-center">
              <FileText className="w-12 h-12 text-white mx-auto mb-3" />
              <h1 className="text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
              <p className="text-blue-100 text-sm">Last updated: January 2024</p>
            </div>

            <div className="p-8 space-y-8">
              <Section
                icon={<UserCheck className="w-6 h-6 text-blue-600" />}
                title="Acceptance of Terms"
              >
                By accessing or using MediAssist AI, you agree to be bound by these Terms and Conditions, our Medical Disclaimer, and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the application.
              </Section>

              <Section
                icon={<Info className="w-6 h-6 text-blue-600" />}
                title="Use of Service"
              >
                MediAssist AI provides AI-powered symptom checking, disease prediction, and health information for educational purposes. You agree to use the service for lawful purposes only and not to misuse the application or attempt to disrupt its operation.
              </Section>

              <Section
                icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
                title="Educational Purpose Only"
              >
                The information provided by MediAssist AI is for educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
              </Section>

              <Section
                icon={<Lock className="w-6 h-6 text-blue-600" />}
                title="Account Responsibilities"
              >
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating an account.
              </Section>

              <Section
                icon={<Scale className="w-6 h-6 text-blue-600" />}
                title="Limitation of Liability"
              >
                The developers and operators of MediAssist AI shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from the use or inability to use the service, including reliance on AI-generated predictions.
              </Section>

              <Section
                icon={<ShieldAlert className="w-6 h-6 text-amber-600" />}
                title="Emergency Situations"
              >
                In case of a medical emergency, do not use MediAssist AI. Call your local emergency services immediately (e.g., 911 in the United States).
              </Section>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Please also review our{' '}
                <Link href="/disclaimer" className="text-blue-600 dark:text-blue-400 hover:underline">Medical Disclaimer</Link>.
                If you do not agree to these terms, please discontinue use immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
        <div className="text-gray-600 dark:text-gray-400 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
