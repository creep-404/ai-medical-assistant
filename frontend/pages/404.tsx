'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft, Stethoscope } from 'lucide-react'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-28 h-28 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Stethoscope className="w-14 h-14 text-blue-600 dark:text-blue-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 mb-4">
            404
          </h1>
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Looks like you&apos;ve wandered into uncharted territory. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go Back Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Dashboard
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <Search className="w-4 h-4" />
          <span>Try searching or go to our</span>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            homepage
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
