'use client';

import { useState } from 'react'
import StepProfile  from '../components/StepProfile'
import StepCustom   from '../components/StepCustom'
import StepDuration from '../components/StepDuration'
import StepConfirm  from '../components/StepConfirm'
import StepLoading  from '../components/StepLoading'
import StepResult   from '../components/StepResult'
import { AppData, AnalysisResult, StepProps } from '../types'

export default function Home() {
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState<AppData>({ profileId: null, goal: null, custom: '', format: 'article', duration: null })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const next    = (patch: Partial<AppData> = {}) => { setData(d => ({ ...d, ...patch })); setStep(s => s + 1) }
  const back    = () => setStep(s => Math.max(0, s - 1))
  const restart = () => { setStep(0); setData({ profileId: null, goal: null, custom: '', format: 'article', duration: null }); setResult(null) }

  const props: StepProps = { data, next, back, result, setResult, restart }

  const showProgress = step >= 1 && step <= 3
  const progressStep = step - 1

  /* Profile step uses wider layout; others use narrow centered column */
  const isWide = step === 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20">

      {/* Brand */}
      <header className="fade-up text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-8">
          <img src="/alan-logo.png" alt="Alan" className="h-14 w-auto" />
          <span className="font-extrabold text-[2rem] tracking-tight text-[#111117]">Mo Studios</span>
        </div>
        <h1 className="font-bold text-[3.5rem] leading-[1.1] tracking-tight text-[#111117]">
          Your health content,<br />designed for you.
        </h1>
      </header>

      {/* Progress bar */}
      {showProgress && (
        <div className={`w-full mb-10 fade-up ${isWide ? 'max-w-[960px]' : 'max-w-[680px]'}`}>
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="h-[3px] flex-1 rounded-full transition-all duration-400"
                style={{ backgroundColor: i <= progressStep ? '#5C58F6' : '#EBEBEF' }} />
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div key={step} className={`fade-up w-full ${isWide ? 'max-w-[960px]' : 'max-w-[680px]'}`}>
        {step === 0 && <StepProfile  {...props} />}
        {step === 1 && <StepCustom   {...props} />}
        {step === 2 && <StepDuration {...props} />}
        {step === 3 && <StepConfirm  {...props} />}
        {step === 4 && <StepLoading  {...props} />}
        {step === 5 && <StepResult   {...props} />}
      </div>

    </div>
  )
}
