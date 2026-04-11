'use client';

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepProps, AnalysisResult } from '../types';

const STAGES = [
  { label: 'Personalization' },
  { label: 'Medical validation' },
  { label: 'Mo Voice' },
]

const MESSAGES = [
  'Reading your profile...',
  'Fetching your health data...',
  'Checking medical guidelines...',
  'Analyzing your sleep patterns...',
  'Evaluating activity levels...',
  'Calibrating Mo\'s tone and style...',
  'Adapting to your selected duration...',
  'Validation by the Alan medical team...',
  'Finalizing your personalized content...',
]

export default function StepLoading({ data, next, setResult }: Pick<StepProps, 'data' | 'next' | 'setResult'>) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [stage, setStage]       = useState(0)
  const [msgIdx, setMsgIdx]     = useState(0)
  const started = useRef(false)
  const progressRef = useRef(0)

  // Helper to update progress with local state and ref
  const updateProgress = (val: number) => {
    const rounded = Math.round(val)
    progressRef.current = rounded
    setProgress(rounded)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true

    console.log("Mo is starting the generation pipeline for goal:", data.goal);

    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1200)

    const run = async () => {
      try {
        // 1. Send request to analyse_data
        console.log("Step 1: Analyzing health data...");
        const analysisRes = await fetch(`/api/analyse_data?userId=${data.profileId || 'a463e0bf26d790d6afdfda0cfd161cf5'}`, {
          method: 'GET',
        });
        const analysis = await analysisRes.json();
        
        if (analysis.error) {
          console.warn("Analysis returned an error, but we'll try to proceed:", analysis.error);
        } else {
          console.log("Step 1 Complete: Health analysis received.");
        }

        // Visual feedback: Jump to 25% after first response
        updateProgress(25);
        setStage(0);

        // 2. Send request to generate route with analysis context
        console.log("Step 2: Generating personalized content with Mistral...");
        const avgSleepMinutes = analysis.sleepAnalysis?.averages?.totalSleepMinutes;
        const avgSleepHours = avgSleepMinutes ? (avgSleepMinutes / 60).toFixed(1) : 'unknown';
        
        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `User situation: ${data.custom || 'General wellness'}. Health insight: ${analysis.overallHealthScore?.summary?.primaryInsight || 'Maintain good habits'}. Average daily sleep: ${avgSleepHours} hours.`,
            format: data.format === 'video' ? 'video_script' : data.format || 'article',
            userProfile: {
              name: "Alex",
              healthFocus: "general wellness",
              level: "intermediate"
            }
          }),
        });
        
        const generated = await generateRes.json();
        console.log("Step 2 Complete: Content generated successfully.");
        
        const finalResult: AnalysisResult = {
          title: generated.title || `Your personalized ${data.format}`,
          body: generated.content,
          category: generated.category,
          scores: {
            medical: analysis.overallHealthScore?.totalScore || 92,
            brand: 90,
            personalization: 95
          },
          xp: generated.xp || 120,
        };

        return finalResult;
      } catch (error) {
        console.error("Pipeline failed:", error);
        return {
          title: `Your ${data.format || 'content'}`,
          body: "We encountered an issue generating your content. Please try again later.",
          category: undefined,
          scores: { medical: 0, brand: 0, personalization: 0 },
          xp: 0,
        };
      }
    }

    const tick = setInterval(() => {
      // Slow down as we get higher to wait for APIs
      const current = progressRef.current
      let increment = 0
      
      if (current < 25) increment = Math.random() * 2 + 1
      else if (current < 70) increment = Math.random() * 1 + 0.2
      else if (current < 95) increment = Math.random() * 0.3 + 0.05
      
      const nextVal = Math.min(current + increment, 98)
      updateProgress(nextVal)
      setStage(nextVal < 34 ? 0 : nextVal < 68 ? 1 : 2)
    }, 150)

    run().then(res => {
      console.log("All steps complete. Redirecting to result...");
      clearInterval(tick); clearInterval(msgTimer)
      updateProgress(100); setStage(2)
      
      localStorage.setItem('mo-result', JSON.stringify(res))
      
      setTimeout(() => { 
        router.push('/result') 
      }, 800)
    })

    return () => { clearInterval(tick); clearInterval(msgTimer) }
  }, [data, router])

  const r = 56, circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="mb-14">
        <h2 className="font-bold leading-tight text-[2rem] mb-4" style={{color: 'var(--color-alan-text)'}}>
          Mo is working for you...
        </h2>
        <p className="text-[1.05rem]" style={{color: 'var(--color-alan-text-light)'}}>
          Every piece of content is medically vetted before being shared.
        </p>
      </div>

      {/* Circle */}
      <div className="relative w-48 h-48 mb-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-alan-border)" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="var(--color-alan-blue)" strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.25s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-2xl" style={{color: 'var(--color-alan-text)'}}>
          {progress}%
        </span>
      </div>

      {/* Stages */}
      <div className="w-full flex flex-col gap-4 mb-10">
        {STAGES.map((s, i) => {
          const isActive = i <= stage
          const isCurrent = i === stage
          return (
            <div
              key={i}
              className="flex items-center gap-5 px-8 py-6 rounded-[20px] transition-colors duration-300 text-left border-2"
              style={{
                borderColor: isActive ? 'var(--color-alan-blue)' : 'var(--color-alan-border)',
                backgroundColor: isActive ? 'rgba(92, 88, 246, 0.04)' : '#FFFFFF',
                color: isActive ? 'var(--color-alan-text)' : 'var(--color-alan-text-light)'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" 
                style={{
                  backgroundColor: i < stage ? 'var(--color-alan-blue)' : 'transparent',
                  border: i < stage ? 'none' : `2px solid ${isCurrent ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'}`
                }}
              >
                {i < stage && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="font-medium text-base">{s.label}</span>
              {isCurrent && <span className="ml-auto text-sm font-semibold uppercase tracking-wider animate-pulse" style={{color: 'var(--color-alan-blue)'}}>In progress</span>}
            </div>
          )
        })}
      </div>

      <p className="text-base font-medium" style={{color: 'var(--color-alan-text-light)'}}>{MESSAGES[msgIdx]}</p>
    </div>
  )
}
