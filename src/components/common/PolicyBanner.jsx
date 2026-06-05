import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

export default function PolicyBanner({ type = 'info', title, body }) {
  const styles = {
    info: {
      container: 'border-sky-400/20 bg-sky-400/5',
      icon: <Info className="w-5 h-5 text-sky-400" />,
      text: 'text-sky-300',
    },
    warning: {
      container: 'border-amber-400/20 bg-amber-400/5',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      text: 'text-amber-300',
    },
    success: {
      container: 'border-sage-400/20 bg-sage-400/5',
      icon: <CheckCircle2 className="w-5 h-5 text-sage-400" />,
      text: 'text-sage-300',
    }
  }

  const s = styles[type] || styles.info

  return (
    <div className={`glass border rounded-2xl p-4 transition-all ${s.container}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{s.icon}</div>
        <div>
          <p className={`font-bold text-sm mb-0.5 ${s.text}`}>{title}</p>
          {body && <p className="text-muted/80 text-xs leading-relaxed">{body}</p>}
        </div>
      </div>
    </div>
  )
}
