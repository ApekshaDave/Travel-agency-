import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full mb-10 overflow-x-auto custom-scrollbar pb-2 px-1">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              i < currentStep 
                ? 'bg-sage-400 text-void' 
                : i === currentStep 
                  ? 'bg-gold-gradient text-void shadow-gold ring-4 ring-gold-400/10' 
                  : 'bg-white/5 border border-white/10 text-muted'
            }`}>
              {i < currentStep ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`text-sm whitespace-nowrap ${
              i === currentStep ? 'text-white font-bold' : 'text-muted'
            }`}>
              {step}
            </span>
          </div>
          
          {i < steps.length - 1 && (
            <div className={`flex-1 min-w-[20px] h-px mx-4 transition-colors duration-500 ${
              i < currentStep ? 'bg-sage-400/50' : 'bg-white/10'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
