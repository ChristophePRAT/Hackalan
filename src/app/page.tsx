'use client';

import { useState } from 'react'
import StepProfile  from '../components/StepProfile'
import StepCustom   from '../components/StepCustom'
import StepFormat   from '../components/StepFormat'
import StepDuration from '../components/StepDuration'
import StepConfirm  from '../components/StepConfirm'
import StepLoading  from '../components/StepLoading'
import StepResult   from '../components/StepResult'
import { AppData, AnalysisResult, StepProps } from '../types'

// Steps: 0=profile, 1=custom, 2=format, 3=duration, 4=confirm, 5=loading, 6=result

export default function Home() {
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState<AppData>({ profileId: null, goal: null, custom: '', format: null, duration: null })
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const next = (patch: Partial<AppData> = {}) => { setData(d => ({ ...d, ...patch })); setStep(s => s + 1) }
  const back = () => setStep(s => Math.max(0, s - 1))
  const restart = () => { setStep(0); setData({ profileId: null, goal: null, custom: '', format: null, duration: null }); setResult(null) }

  const props: StepProps = { data, next, back, result, setResult, restart }

  const showProgress = step >= 1 && step <= 4
  const progressStep = step - 1

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[900px] mx-auto">

        {/* Brand */}
        <header className="mb-10 fade-up text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-8">
            <img src="/alan-logo.png" alt="Alan Logo" className="h-14 w-auto" />
            <span className="font-extrabold text-3xl tracking-tight text-[#191919]">Mo Studios</span>
          </div>
          <h1 className="font-bold text-[3.25rem] leading-[1.1] tracking-tight text-[#191919]">
            Your health content,<br />designed for you.
          </h1>
        </header>

        {/* Card shell */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E4E9] overflow-hidden">

          {/* Progress bar */}
          {showProgress && (
            <div className="flex gap-1.5 px-8 pt-6 pb-0">
              {[0,1,2,3].map(i => (
                <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i <= progressStep ? 'var(--color-alan-blue)' : '#E4E4E9' }} />
              ))}
            </div>
          )}

          <div key={step} className="fade-up p-8 sm:p-10">
            {step === 0 && <StepProfile  {...props} />}
            {step === 1 && <StepCustom   {...props} />}
            {step === 2 && <StepFormat   {...props} />}
            {step === 3 && <StepDuration {...props} />}
            {step === 4 && <StepConfirm  {...props} />}
            {step === 5 && <StepLoading  {...props} />}
            {step === 6 && <StepResult   {...props} />}
          </div>

        </div>
      </div>
    </div>
  )
}
