import { motion } from 'framer-motion'

export default function StickyActionBar({ children, className = '' }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 lg:hidden ${className}`}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        {children}
      </div>
    </motion.div>
  )
}
