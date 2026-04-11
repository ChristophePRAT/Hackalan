'use client';

import { useState } from 'react'
import StepGoal     from '../components/StepGoal'
import StepCustom   from '../components/StepCustom'
import StepFormat   from '../components/StepFormat'
import StepDuration from '../components/StepDuration'
import StepConfirm  from '../components/StepConfirm'
import StepLoading  from '../components/StepLoading'
import StepResult   from '../components/StepResult'
import { AppData, AnalysisResult, StepProps } from '../types'

// Steps: 0=goal, 1=custom, 2=format, 3=duration, 4=confirm, 5=loading, 6=result
const PROGRESS_STEPS = 5 // steps 0–4 show progress

export default function Home() {
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState<AppData>({ goal: null, custom: '', format: null, duration: null })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const next = (patch: Partial<AppData> = {}) => {
    setData(d => ({ ...d, ...patch }));
    setStep(s => s + 1);
  }
  const back = () => setStep(s => Math.max(0, s - 1))
  const restart = () => {
    setStep(0);
    setData({ goal: null, custom: '', format: null, duration: null });
    setResult(null);
  }

  const props: StepProps = { data, next, back, result, setResult, restart }

  const showProgress = step < 5
  const progressStep = step // 0–4

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-[800px] mx-auto">

        {/* Brand */}
        <header className="mb-16 fade-up text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <svg width="46" height="46" viewBox="0 0 100 100" fill="var(--color-alan-blue)" xmlns="http://www.w3.org/2000/svg">
              <path d="M 28 36 C 18 36 12 30 12 24 C 12 14 20 8 28 8 C 36 8 40 16 35 26 C 33 30 30 36 28 36 Z" />
              <path d="M 72 36 C 82 36 88 30 88 24 C 88 14 80 8 72 8 C 64 8 60 16 65 26 C 67 30 70 36 72 36 Z" />
              <ellipse cx="50" cy="35" rx="26" ry="18" />
              <path d="M 32 60 C 32 80, 68 80, 68 60 C 68 70, 32 70, 32 60 Z" />
            </svg>
            <span className="font-extrabold text-[1.6rem] tracking-tight leading-none pt-2" style={{color: 'var(--color-alan-text)'}}>Mo Studios</span>
          </div>
          <h1 className="font-semibold leading-tight text-[2.75rem] mb-4" style={{color: 'var(--color-alan-text)'}}>
            Your health content,<br/>designed for you.
          </h1>
        </header>

        {/* Progress bar (Clean Alan style) */}
        {showProgress && (
          <div className="flex gap-2 mb-12 fade-up">
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full transition-all duration-300"
                style={{backgroundColor: i <= progressStep ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'}}
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
