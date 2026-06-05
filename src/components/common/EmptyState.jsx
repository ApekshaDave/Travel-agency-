import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, actions = [] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6 glass border border-border/50 rounded-3xl"
    >
      {Icon && (
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-muted/40" />
        </div>
      )}
      <h3 className="text-white font-display text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm mx-auto mb-8">{description}</p>
      
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action, i) => (
            <Link
              key={i}
              to={action.href}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                action.primary 
                  ? 'bg-gold-gradient text-void shadow-gold' 
                  : 'glass border border-border text-white hover:bg-white/5'
              }`}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
