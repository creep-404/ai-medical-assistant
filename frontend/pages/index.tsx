'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Heart, Activity, Stethoscope, Pill, Calendar, FileText,
  Brain, ChevronDown, Menu, X, Moon, Sun, Users, Shield,
  Star, ChevronRight, ArrowRight, Clock, User, Mail, Phone,
  MapPin, Linkedin, Twitter, Github, AlertTriangle, Plus,
  Search, CheckCircle, MessageSquare, TrendingUp, Award
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/lib/navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-100px' },
  transition: { staggerChildren: 0.1 },
}

export default function HomePage() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        userRole={user?.role ?? null}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        scrolled={scrolled}
      />

      <HeroSection isAuthenticated={isAuthenticated} userRole={user?.role ?? null} />

      <FeaturesSection />

      <HowItWorksSection />

      <StatisticsSection />

      <DoctorsSection />

      <TestimonialsSection />

      <FAQSection />

      <CTASection />

      <FooterSection />
    </div>
  )
}

function Navbar({
  isDark,
  toggleTheme,
  isAuthenticated,
  userRole,
  mobileMenu,
  setMobileMenu,
  scrolled,
}: {
  isDark: boolean
  toggleTheme: () => void
  isAuthenticated: boolean
  userRole: string | null
  mobileMenu: boolean
  setMobileMenu: (v: boolean) => void
  scrolled: boolean
}) {
  const [activeSection, setActiveSection] = useState('home')

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              MediAssist AI
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <Link
                href={getDashboardPath(userRole)}
                className="py-2 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="py-2 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenu(false)
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                {isAuthenticated ? (
                  <Link
                    href={getDashboardPath(userRole)}
                    onClick={() => setMobileMenu(false)}
                    className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function HeroSection({ isAuthenticated, userRole }: { isAuthenticated: boolean; userRole: string | null }) {
  const router = useRouter()

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-emerald-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300 rounded-full blur-3xl" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
          >
            <Brain className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-blue-100">AI-Powered Healthcare Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
          >
            Your Intelligent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">
              Health Companion
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed"
          >
            Early Guidance. Smarter Healthcare. Leverage the power of AI to check symptoms, predict diseases, 
            get medicine recommendations, and connect with expert doctors — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {isAuthenticated ? (
              <Link
                href={getDashboardPath(userRole)}
                className="inline-flex items-center justify-center gap-2 py-4 px-8 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 py-4 px-8 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center gap-2 py-4 px-8 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 text-lg"
            >
              Learn More
              <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl"
        >
          {[
            { value: '10K+', label: 'Active Users', icon: Users },
            { value: '18+', label: 'Diseases Covered', icon: Activity },
            { value: '95%', label: 'Prediction Accuracy', icon: TrendingUp },
            { value: '30+', label: 'Expert Doctors', icon: Award },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-colors"
            >
              <stat.icon className="w-5 h-5 text-blue-200 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-200">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: Search,
    title: 'Symptom Checker',
    description: 'Describe your symptoms and let AI analyze them to identify potential conditions with high accuracy.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Brain,
    title: 'Disease Prediction',
    description: 'Advanced ML models predict diseases based on your symptoms, medical history, and risk factors.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Pill,
    title: 'Medicine Recommendations',
    description: 'Get intelligent medicine suggestions with dosage information and potential side effects.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Calendar,
    title: 'Doctor Appointments',
    description: 'Book appointments with specialized doctors directly through the platform with real-time availability.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Heart,
    title: 'Health Dashboard',
    description: 'Track your health metrics, view history, and monitor your wellness journey over time.',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: FileText,
    title: 'PDF Reports',
    description: 'Generate comprehensive PDF health reports with predictions, recommendations, and medical insights.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-4">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Better Health
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive AI-powered tools designed to help you make informed healthcare decisions.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={{
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div
                className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7 text-gray-700 dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/link"
              >
                Learn more
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: User,
    number: '01',
    title: 'Sign Up Free',
    description: 'Create your account in seconds. No credit card required. Choose your role as patient or doctor.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Enter Symptoms',
    description: 'Describe your symptoms in detail using our intuitive interface. Add duration, severity, and relevant history.',
  },
  {
    icon: Brain,
    number: '03',
    title: 'Get AI Prediction',
    description: 'Our AI analyzes your symptoms against thousands of medical cases to provide accurate predictions.',
  },
  {
    icon: Stethoscope,
    number: '04',
    title: 'Consult a Doctor',
    description: 'Review your results and book a consultation with a specialist doctor for professional confirmation.',
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-4 py-2 mb-4">
            <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Health Journey in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Four Steps
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Getting started is simple. Follow these steps to take control of your health.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-blue-200 dark:from-blue-800 dark:via-emerald-800 dark:to-blue-800 -translate-y-1/2" />

          <motion.div
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={{
                  initial: { opacity: 0, y: 40 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="w-9 h-9 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:-top-4 w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StatisticsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: 10000, suffix: '+', label: 'Active Users', icon: Users, prefix: '' },
    { value: 18, suffix: '+', label: 'Diseases Covered', icon: Activity, prefix: '' },
    { value: 95, suffix: '%', label: 'Prediction Accuracy', icon: TrendingUp, prefix: '' },
    { value: 30, suffix: '+', label: 'Expert Doctors', icon: Award, prefix: '' },
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 to-emerald-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Making Healthcare
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">
              Smarter Every Day
            </span>
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Our growing community trusts MediAssist AI for their healthcare needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-1">
                <Counter value={stat.value} isInView={isInView} />
                {stat.suffix}
              </div>
              <div className="text-blue-200">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Counter({ value, isInView }: { value: number; isInView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return <>{count}</>
}

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    experience: '15 years',
    rating: 4.9,
    patients: '2,500+',
    image: null,
    icon: Heart,
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    experience: '12 years',
    rating: 4.8,
    patients: '1,800+',
    image: null,
    icon: Brain,
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Internal Medicine',
    experience: '18 years',
    rating: 4.9,
    patients: '3,200+',
    image: null,
    icon: Stethoscope,
  },
  {
    name: 'Dr. James Wilson',
    specialty: 'Pediatrics',
    experience: '10 years',
    rating: 4.7,
    patients: '1,500+',
    image: null,
    icon: Heart,
  },
]

function DoctorsSection() {
  return (
    <section id="doctors" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-4">
            <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Our Doctors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Consult with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Expert Physicians
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with experienced doctors across multiple specialties.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.name}
              variants={{
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <doctor.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{doctor.specialty}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{doctor.rating}</span>
                <span className="text-gray-400 text-sm">({doctor.patients} patients)</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{doctor.experience} experience</p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center gap-1 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
              >
                Book Appointment
                <Calendar className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Patient',
    content: 'MediAssist AI helped me identify a condition early. The symptom checker was surprisingly accurate, and I was able to see a specialist quickly. Highly recommended!',
    rating: 5,
    initials: 'SM',
  },
  {
    name: 'Dr. Robert Kim',
    role: 'Physician',
    content: 'As a doctor, I appreciate how this tool helps patients come prepared with insights. It streamlines consultations and makes conversations more productive.',
    rating: 5,
    initials: 'RK',
  },
  {
    name: 'Emily Davis',
    role: 'Patient',
    content: 'The medicine recommendations and health dashboard are game-changers. I can track everything in one place and share reports with my doctor effortlessly.',
    rating: 5,
    initials: 'ED',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Users Say
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real stories from people who use MediAssist AI.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              variants={{
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 relative"
            >
              <div className="absolute top-6 right-6 text-6xl text-blue-200 dark:text-blue-800/40 font-serif leading-none">
                &ldquo;
              </div>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 relative z-10">
                {t.content}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const faqData = [
  {
    question: 'How accurate is the symptom checker?',
    answer: 'Our AI model achieves over 95% accuracy in controlled testing. However, it is designed for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for proper diagnosis.',
  },
  {
    question: 'Is my medical data secure and private?',
    answer: 'Absolutely. We use industry-standard encryption for all data transmission and storage. Your health information is never shared without your explicit consent. We comply with healthcare data protection regulations.',
  },
  {
    question: 'Can I book appointments with real doctors?',
    answer: 'Yes! MediAssist AI connects you with verified healthcare professionals across multiple specialties. You can view doctor profiles, check availability, and book appointments directly through the platform.',
  },
  {
    question: 'Is MediAssist AI free to use?',
    answer: 'Basic symptom checking and disease prediction features are free. Premium features like detailed PDF reports, priority doctor consultations, and advanced health analytics are available through subscription plans.',
  },
  {
    question: 'How do I generate a health report?',
    answer: 'After completing a symptom check, you can generate a comprehensive PDF report with one click. The report includes your symptoms, AI predictions, medicine recommendations, and can be shared with your healthcare provider.',
  },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-4">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-4"
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              variants={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
              >
                <span className="text-base lg:text-lg font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-600 to-emerald-700 rounded-3xl p-8 lg:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of users who trust MediAssist AI for smarter, faster healthcare guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 py-4 px-8 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-4 px-8 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Sign In
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediAssist AI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your intelligent healthcare companion for symptom checking, disease prediction, and connecting with expert doctors.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Doctors', href: '#doctors' },
                { label: 'FAQ', href: '#faq' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Contact Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Medical Disclaimer', href: '/disclaimer' },
                { label: 'Help Center', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                123 Healthcare Ave, Medical District
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@mediassistai.com
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center lg:text-left">
              &copy; {new Date().getFullYear()} MediAssist AI. All rights reserved.
            </p>
            <div className="flex items-start gap-2 text-xs text-gray-500 max-w-2xl">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-gray-400">Medical Disclaimer:</strong> This application is for educational purposes only. 
                It is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions. 
                <Link href="/disclaimer" className="text-blue-400 hover:underline ml-1">Read full disclaimer</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
