'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, ArrowLeft, Scale, Info, Activity } from 'lucide-react'

export default function DisclaimerPage() {
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
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-center">
              <ShieldAlert className="w-12 h-12 text-white mx-auto mb-3" />
              <h1 className="text-3xl font-bold text-white mb-2">Medical Disclaimer</h1>
              <p className="text-amber-100 text-sm">Last updated: January 2024</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Important Notice
                    </h2>
                    <p className="text-amber-700 dark:text-amber-300">
                      This application is intended for <strong>educational purposes only</strong>. It is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                  </div>
                </div>
              </div>

              <Section
                icon={<Info className="w-6 h-6 text-blue-600" />}
                title="Not a Medical Device"
              >
                MediAssist AI is not a certified medical device nor has it been evaluated by the FDA or any other regulatory body. The predictions and recommendations provided by this system are based on machine learning models and should not be used as the sole basis for medical decisions.
              </Section>

              <Section
                icon={<Scale className="w-6 h-6 text-blue-600" />}
                title="No Doctor-Patient Relationship"
              >
                Use of MediAssist AI does not establish a doctor-patient relationship. The information provided does not constitute medical advice and should not replace consultation with a qualified healthcare professional.
              </Section>

              <Section
                icon={<Activity className="w-6 h-6 text-blue-600" />}
                title="Emergency Situations"
              >
                If you are experiencing a medical emergency, call your local emergency services immediately (e.g., 911 in the United States). Do not rely on MediAssist AI for emergency medical assistance.
              </Section>

              <Section
                icon={<AlertTriangle className="w-6 h-6 text-blue-600" />}
                title="Accuracy Limitations"
              >
                While we strive for high accuracy, the AI model may produce incorrect predictions or recommendations. Factors such as incomplete symptom descriptions, rare conditions, or data limitations can affect results. Always consult a healthcare professional for proper diagnosis.
              </Section>

              <Section
                icon={<Info className="w-6 h-6 text-blue-600" />}
                title="Data Privacy"
              >
                We take data privacy seriously. However, for complete confidentiality, avoid sharing personally identifiable information beyond what is necessary for symptom checking. Review our Privacy Policy for more details on how your data is handled.
              </Section>

              <Section
                icon={<Scale className="w-6 h-6 text-blue-600" />}
                title="User Responsibility"
              >
                By using MediAssist AI, you acknowledge and agree that:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The information provided is for informational purposes only</li>
                  <li>You will not rely solely on AI predictions for health decisions</li>
                  <li>You will seek professional medical advice for any health concerns</li>
                  <li>The developers and operators are not liable for any damages arising from use</li>
                </ul>
              </Section>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                By continuing to use MediAssist AI, you accept this disclaimer and our{' '}
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>.
                If you do not agree, please discontinue use immediately.
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
