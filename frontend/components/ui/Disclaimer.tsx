import { AlertTriangle } from 'lucide-react'

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-cream-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-4 text-xs text-ink-500 dark:text-cream-400/70">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-500" />
      <p>
        <strong className="text-ink-700 dark:text-cream-200">Medical Disclaimer:</strong> This application is
        intended for educational purposes only. It does not replace professional medical advice, diagnosis, or
        treatment. Always consult a licensed healthcare provider for serious medical conditions.
      </p>
    </div>
  )
}
