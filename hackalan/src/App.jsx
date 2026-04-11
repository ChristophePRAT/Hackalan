import { useState } from 'react'
import './index.css'
import StepGoal     from './components/StepGoal'
import StepCustom   from './components/StepCustom'
import StepFormat   from './components/StepFormat'
import StepDuration from './components/StepDuration'
import StepConfirm  from './components/StepConfirm'
import StepLoading  from './components/StepLoading'
import StepResult   from './components/StepResult'

// Steps: 0=goal, 1=custom, 2=format, 3=duration, 4=confirm, 5=loading, 6=result
const PROGRESS_STEPS = 5 // steps 0–4 show progress

export default function App() {
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState({ goal: null, custom: '', format: null, duration: null })
  const [result, setResult] = useState(null)

  const next    = (patch = {}) => { setData(d => ({ ...d, ...patch })); setStep(s => s + 1) }
  const back    = () => setStep(s => Math.max(0, s - 1))
  const restart = () => { setStep(0); setData({ goal: null, custom: '', format: null, duration: null }); setResult(null) }

  const props = { data, next, back, result, setResult, restart }

  const showProgress = step < 5
  const progressStep = step // 0–4

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14" style={{backgroundColor:'#f4efe6'}}>
      <div className="w-full max-w-xl">

        {/* Brand */}
        <header className="mb-12 fade-up">
          <p className="text-xs uppercase tracking-[0.22em] mb-3" style={{color:'#4e6e54'}}>Alan · Mo Studios</p>
          <h1 className="font-[--font-serif] italic font-light leading-none" style={{fontSize:'clamp(2.4rem,5vw,3.2rem)',color:'#1a3a2a'}}>
            Votre contenu santé,<br/>pensé pour vous.
          </h1>
        </header>

        {/* Progress dots */}
        {showProgress && (
          <div className="flex gap-2 mb-10 fade-up">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="h-[3px] flex-1 rounded-full transition-all duration-500"
                style={{backgroundColor: i <= progressStep ? '#1a3a2a' : '#e2d5bf'}}
              />
            ))}
          </div>
        )}

        <div key={step} className="fade-up">
          {step === 0 && <StepGoal     {...props} />}
          {step === 1 && <StepCustom   {...props} />}
          {step === 2 && <StepFormat   {...props} />}
          {step === 3 && <StepDuration {...props} />}
          {step === 4 && <StepConfirm  {...props} />}
          {step === 5 && <StepLoading  {...props} />}
          {step === 6 && <StepResult   {...props} />}
        </div>

      </div>
    </div>
  )
}
