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
  Search, CheckCircle, MessageSquare, TrendingUp, Award, Sparkles
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useMounted } from '@/hooks/useMounted'
import { getDashboardPath } from '@/lib/navigation'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
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
    <div className="min-h-screen bg-cream-100 dark:bg-ink-950">
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
          ? 'bg-cream-100/90 dark:bg-ink-950/90 backdrop-blur-xl shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Logo />

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(link.label)
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-medium transition-colors ${
                  activeSection === link.label
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-ink-600 dark:text-cream-300/70 hover:text-primary-700 dark:hover:text-primary-300'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-ink-500 dark:text-cream-300/70 hover:bg-primary-50 dark:hover:bg-ink-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <Link href={getDashboardPath(userRole)}>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 px-4 text-sm font-semibold text-ink-700 dark:text-cream-200 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-ink-500 dark:text-cream-300/70 hover:bg-primary-50 dark:hover:bg-ink-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 rounded-xl text-ink-500 dark:text-cream-300/70 hover:bg-primary-50 dark:hover:bg-ink-800 transition-colors"
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
            className="lg:hidden bg-cream-100 dark:bg-ink-950 border-t border-cream-200 dark:border-ink-800"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenu(false)
                    setActiveSection(link.label)
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="block py-2 text-sm font-medium text-ink-700 dark:text-cream-200 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-cream-200 dark:border-ink-800 flex gap-3">
                {isAuthenticated ? (
                  <Link
                    href={getDashboardPath(userRole)}
                    onClick={() => setMobileMenu(false)}
                    className="flex-1 text-center"
                  >
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center py-2 px-4 rounded-xl border border-cream-300 dark:border-ink-700 text-ink-700 dark:text-cream-200 text-sm font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center"
                    >
                      <Button className="w-full">Get Started</Button>
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
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cream-100 to-accent-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-300/40 dark:bg-primary-800/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent-300/40 dark:bg-accent-800/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-200/30 dark:bg-primary-700/10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white dark:bg-ink-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-soft border border-cream-200 dark:border-ink-700"
          >
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
              AI-Powered Healthcare Assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-ink-900 dark:text-cream-100 mb-6 leading-[1.05]"
          >
            Your intelligent{' '}
            <em className="text-gradient-accent not-italic font-display italic">health companion</em>
            , around the clock
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-ink-600 dark:text-cream-300/70 mb-10 max-w-2xl leading-relaxed"
          >
            Early guidance. Smarter healthcare. Leverage the power of AI to check symptoms, predict diseases,
            get medicine recommendations, and connect with expert doctors — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {isAuthenticated ? (
              <Link href={getDashboardPath(userRole)}>
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Button variant="outline" size="lg">
                Learn More
                <ChevronDown className="w-5 h-5" />
              </Button>
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
              className="card card-hover p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-primary-600 dark:text-primary-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-ink-900 dark:text-cream-100">{stat.value}</div>
              <div className="text-sm text-ink-500 dark:text-cream-400/70">{stat.label}</div>
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
    tint: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
  },
  {
    icon: Brain,
    title: 'Disease Prediction',
    description: 'Advanced ML models predict diseases based on your symptoms, medical history, and risk factors.',
    tint: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-300',
  },
  {
    icon: Pill,
    title: 'Medicine Recommendations',
    description: 'Get intelligent medicine suggestions with dosage information and potential side effects.',
    tint: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
  },
  {
    icon: Calendar,
    title: 'Doctor Appointments',
    description: 'Book appointments with specialized doctors directly through the platform with real-time availability.',
    tint: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-300',
  },
  {
    icon: Heart,
    title: 'Health Dashboard',
    description: 'Track your health metrics, view history, and monitor your wellness journey over time.',
    tint: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
  },
  {
    icon: FileText,
    title: 'PDF Reports',
    description: 'Generate comprehensive PDF health reports with predictions, recommendations, and medical insights.',
    tint: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-300',
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white dark:bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            <Activity className="w-4 h-4" />
            Features
          </Badge>
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-ink-900 dark:text-cream-100 mb-4">
            Everything you need for{' '}
            <em className="text-gradient-primary not-italic font-display italic">better health</em>
          </h2>
          <p className="text-lg text-ink-500 dark:text-cream-400/70">
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
              className="card card-hover p-6 lg:p-8 group"
            >
              <div
                className={`w-14 h-14 ${feature.tint} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="heading-display text-xl font-semibold text-ink-900 dark:text-cream-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-ink-500 dark:text-cream-400/70 leading-relaxed">{feature.description}</p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-600 group/link"
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
    <section id="how-it-works" className="py-20 lg:py-28 bg-cream-100 dark:bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="accent" className="mb-4">
            <Brain className="w-4 h-4" />
            How It Works
          </Badge>
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-ink-900 dark:text-cream-100 mb-4">
            Your health journey in{' '}
            <em className="text-gradient-primary not-italic font-display italic">four steps</em>
          </h2>
          <p className="text-lg text-ink-500 dark:text-cream-400/70">
            Getting started is simple. Follow these steps to take control of your health.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-primary-200 dark:from-primary-800 dark:via-accent-800 dark:to-primary-800 -translate-y-1/2" />

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
                className="relative text-center group"
              >
                <div className="relative z-10 inline-block">
                  <div className="w-20 h-20 bg-white dark:bg-ink-800 rounded-2xl border border-cream-200 dark:border-ink-700 shadow-soft flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="w-9 h-9 text-primary-700 dark:text-primary-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:-top-4 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>
                <h3 className="heading-display text-xl font-semibold text-ink-900 dark:text-cream-100 mb-2 mt-4">
                  {step.title}
                </h3>
                <p className="text-ink-500 dark:text-cream-400/70 leading-relaxed text-sm">{step.description}</p>
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
    <section className="py-20 lg:py-28 gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-white mb-4">
            Making healthcare{' '}
            <em className="text-primary-100 not-italic font-display italic">smarter every day</em>
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
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
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/15">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-1">
                <Counter value={stat.value} isInView={isInView} />
                {stat.suffix}
              </div>
              <div className="text-primary-100">{stat.label}</div>
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
    <section id="doctors" className="py-20 lg:py-28 bg-white dark:bg-ink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            <Stethoscope className="w-4 h-4" />
            Our Doctors
          </Badge>
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-ink-900 dark:text-cream-100 mb-4">
            Consult with{' '}
            <em className="text-gradient-primary not-italic font-display italic">expert physicians</em>
          </h2>
          <p className="text-lg text-ink-500 dark:text-cream-400/70">
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
              className="card card-hover p-6 text-center"
            >
              <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lift">
                <doctor.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="heading-display text-lg font-semibold text-ink-900 dark:text-cream-100">
                {doctor.name}
              </h3>
              <p className="text-primary-700 dark:text-primary-300 text-sm font-semibold">{doctor.specialty}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                <span className="text-sm font-medium text-ink-700 dark:text-cream-200">{doctor.rating}</span>
                <span className="text-ink-400 text-sm">({doctor.patients} patients)</span>
              </div>
              <p className="text-sm text-ink-500 dark:text-cream-400/70 mt-1">{doctor.experience} experience</p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center justify-center gap-1 w-full py-2.5 px-4 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-soft"
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
    <section className="py-20 lg:py-28 bg-cream-100 dark:bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="accent" className="mb-4">
            <Star className="w-4 h-4" />
            Testimonials
          </Badge>
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-ink-900 dark:text-cream-100 mb-4">
            What our{' '}
            <em className="text-gradient-primary not-italic font-display italic">users say</em>
          </h2>
          <p className="text-lg text-ink-500 dark:text-cream-400/70">
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
              className="card p-8 relative card-hover"
            >
              <div className="absolute top-6 right-6 text-6xl text-primary-200 dark:text-primary-800/40 font-display leading-none">
                &ldquo;
              </div>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <p className="text-ink-600 dark:text-cream-300/70 leading-relaxed mb-6 relative z-10">
                {t.content}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-ink-900 dark:text-cream-100 text-sm">{t.name}</div>
                  <div className="text-ink-500 dark:text-cream-400/70 text-xs">{t.role}</div>
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
    <section id="faq" className="py-20 lg:py-28 bg-white dark:bg-ink-900/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            <MessageSquare className="w-4 h-4" />
            FAQ
          </Badge>
          <h2 className="heading-display text-4xl sm:text-5xl font-semibold text-ink-900 dark:text-cream-100 mb-4">
            Frequently asked{' '}
            <em className="text-gradient-primary not-italic font-display italic">questions</em>
          </h2>
          <p className="text-lg text-ink-500 dark:text-cream-400/70">
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
              className="card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
              >
                <span className="text-base lg:text-lg font-medium text-ink-900 dark:text-cream-100 pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-ink-400 flex-shrink-0" />
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
                    <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-ink-500 dark:text-cream-400/70 leading-relaxed">
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
    <section className="py-20 lg:py-28 bg-cream-100 dark:bg-ink-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="gradient-primary rounded-3xl p-8 lg:p-16 relative overflow-hidden shadow-lift"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4">
              Ready to take control of your health?
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
              Join thousands of users who trust MediAssist AI for smarter, faster healthcare guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white !text-primary-700 hover:!bg-cream-100 shadow-xl hover:shadow-2xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-200"
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
  const mounted = useMounted()
  return (
    <footer className="bg-ink-900 dark:bg-ink-950 text-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo variant="light" />
            <p className="text-cream-400/70 text-sm leading-relaxed mb-6 mt-4">
              Your intelligent healthcare companion for symptom checking, disease prediction, and connecting with expert doctors.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-ink-800 dark:bg-ink-800/80 rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors"
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
                    onClick={(e) => {
                      e.preventDefault()
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm text-cream-400/70 hover:text-white transition-colors"
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
                    className="text-sm text-cream-400/70 hover:text-white transition-colors"
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
              <li className="flex items-start gap-3 text-sm text-cream-400/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                123 Healthcare Ave, Medical District
              </li>
              <li className="flex items-center gap-3 text-sm text-cream-400/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@mediassistai.com
              </li>
              <li className="flex items-center gap-3 text-sm text-cream-400/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-sm text-cream-400/60 text-center lg:text-left">
              &copy; {mounted ? new Date().getFullYear() : 2024} MediAssist AI. All rights reserved.
            </p>
            <div className="flex items-start gap-2 text-xs text-cream-400/60 max-w-2xl">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-400" />
              <p>
                <strong className="text-cream-200">Medical Disclaimer:</strong> This application is for educational purposes only.
                It is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions.
                <Link href="/disclaimer" className="text-primary-300 hover:underline ml-1">Read full disclaimer</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
