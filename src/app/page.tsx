'use client';

import { useState } from 'react'
import StepProfile  from '../components/StepProfile'
import StepGoal     from '../components/StepGoal'
import StepCustom   from '../components/StepCustom'
import StepFormat   from '../components/StepFormat'
import StepDuration from '../components/StepDuration'
import StepConfirm  from '../components/StepConfirm'
import StepLoading  from '../components/StepLoading'
import StepResult   from '../components/StepResult'
import { AppData, AnalysisResult, StepProps } from '../types'

// Steps: 0=profile, 1=goal, 2=custom, 3=format, 4=duration, 5=confirm, 6=loading, 7=result
// Progress bar covers steps 1–5 (5 segments)

export default function Home() {
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState<AppData>({ profileId: null, goal: null, custom: '', format: null, duration: null })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const next = (patch: Partial<AppData> = {}) => {
    setData(d => ({ ...d, ...patch }));
    setStep(s => s + 1);
  }
  const back = () => setStep(s => Math.max(0, s - 1))
  const restart = () => {
    setStep(0);
    setData({ profileId: null, goal: null, custom: '', format: null, duration: null });
    setResult(null);
  }

  const props: StepProps = { data, next, back, result, setResult, restart }

  // Progress bar shows on steps 1–5 (goal → confirm)
  const showProgress = step >= 1 && step <= 5
  const progressStep = step - 1 // maps step 1→0, 2→1, ... 5→4

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-12 py-20">
      <div className="w-full max-w-[960px] mx-auto">

        {/* Brand */}
        <header className="mb-12 fade-up text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-10">
            <img src="/alan-logo.png" alt="Alan Logo" className="h-[60px] w-auto" />
            <span className="font-extrabold text-[1.9rem] tracking-tight leading-none" style={{color: 'var(--color-alan-text)'}}>Mo Studios</span>
          </div>
          <h1 className="font-bold leading-[1.15] text-[3.5rem] mb-6" style={{color: 'var(--color-alan-text)'}}>
            Your health content,<br/>designed for you.
          </h1>
        </header>

        {/* Progress bar */}
        {showProgress && (
          <div className="flex gap-2 mb-16 fade-up">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="h-[5px] flex-1 rounded-full transition-all duration-300"
                style={{backgroundColor: i <= progressStep ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'}}
              />
            ))}
          </div>
        )}

        <div key={step} className="fade-up">
          {step === 0 && <StepProfile  {...props} />}
          {step === 1 && <StepGoal     {...props} />}
          {step === 2 && <StepCustom   {...props} />}
          {step === 3 && <StepFormat   {...props} />}
          {step === 4 && <StepDuration {...props} />}
          {step === 5 && <StepConfirm  {...props} />}
          {step === 6 && <StepLoading  {...props} />}
          {step === 7 && <StepResult   {...props} />}
        </div>

      </div>
    </div>
  )
}
