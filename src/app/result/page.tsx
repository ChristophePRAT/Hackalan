'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisResult } from '../../types';
import { CATEGORIES, XP_PER_LEVEL } from '../../constants';

const SCORE_META = {
  medical:         { label: 'Medical accuracy', color: '#10B981' },
  brand:           { label: 'Mo · Alan Voice',  color: 'var(--color-alan-blue)' },
  personalization: { label: 'Personalization',  color: '#F59E0B' },
} as const;

function getCategoryMeta(label?: string) {
  return CATEGORIES.find(c => c.label === label) ?? { label: label ?? 'Health', color: 'var(--color-alan-blue)', bg: '#EEF2FF' };
}

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult]     = useState<AnalysisResult | null>(null)
  const [copied, setCopied]     = useState(false)
  const [validated, setValidated] = useState(false)
  const [totalXp, setTotalXp]   = useState(0)
  const [levelUp, setLevelUp]   = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mo-result')
    if (saved) {
      setResult(JSON.parse(saved))
    } else {
      router.push('/')
    }
    const stored = parseInt(localStorage.getItem('mo-total-xp') ?? '0', 10)
    setTotalXp(stored)
  }, [router])

  const copy = () => {
    if (typeof window !== 'undefined' && result?.sections) {
      let text = ''
      result.sections.forEach(section => {
        text += `${section.explanation.title}\n`
        text += `${section.explanation.paragraph}\n\n`
        if (section.objectives.length > 0) {
          section.objectives.forEach(obj => {
            text += `• ${obj.title}\n${obj.description}\n\n`
          })
        }
      })
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const validate = () => {
    if (validated) return
    const earned = result?.xp ?? 100
    const prev = totalXp
    const next = prev + earned
    const prevLevel = Math.floor(prev / XP_PER_LEVEL) + 1
    const nextLevel = Math.floor(next / XP_PER_LEVEL) + 1
    localStorage.setItem('mo-total-xp', String(next))
    setTotalXp(next)
    setValidated(true)
    if (nextLevel > prevLevel) setLevelUp(true)
  }

  const restart = () => {
    localStorage.removeItem('mo-result')
    router.push('/')
  }

  if (!result) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const cat   = getCategoryMeta(result.category)
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpInLevel = totalXp % XP_PER_LEVEL
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100

  return (
    <div className="min-h-screen bg-white px-12 py-16 flex flex-col items-center">
      <div className="w-full max-w-[960px] mx-auto">

        {/* Brand */}
        <header className="mb-10 fade-up text-center">
          <div className="inline-flex items-center justify-center gap-4">
            <img src="/alan-logo.png" alt="Alan Logo" className="h-[52px] w-auto" />
            <span className="font-extrabold text-[1.7rem] tracking-tight leading-none" style={{color: 'var(--color-alan-text)'}}>Mo Studios</span>
          </div>
        </header>

        <div className="fade-up">

          {/* Category + XP badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold tracking-wide"
              style={{ backgroundColor: cat.bg, color: cat.color }}>
              {cat.label}
            </span>
            <span className="text-sm font-bold" style={{color: 'var(--color-alan-text-light)'}}>
              +{result.xp ?? 100} XP à gagner
            </span>
          </div>

          {/* Content card */}
          <div className="rounded-[20px] border-2 overflow-hidden mb-8"
            style={{ borderColor: cat.color + '40', backgroundColor: '#FAFAFA' }}>
            {result.sections.map((section, sIdx) => (
              <div key={sIdx}>
                <div className="px-8 pt-8 pb-6" style={{ borderBottom: sIdx < result.sections.length - 1 ? '1px solid var(--color-alan-border)' : 'none', backgroundColor: sIdx === 0 ? cat.bg + 'CC' : '#FAFAFA' }}>
                  <h2 className="font-bold leading-snug text-[1.5rem]" style={{color: 'var(--color-alan-text)'}}>{section.explanation.title}</h2>
                </div>
                <div className="px-8 py-8 text-[1rem] leading-relaxed" style={{color: 'var(--color-alan-text)'}}>
                  <p className="mb-6">{section.explanation.paragraph}</p>
                  {section.objectives.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-4" style={{color: 'var(--color-alan-text)'}}>Objectives</h3>
                      <div className="space-y-4">
                        {section.objectives.map((obj, oIdx) => (
                          <div key={oIdx} className="flex gap-3">
                            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{backgroundColor: cat.color}} />
                            <div className="flex-1">
                              <p className="font-semibold mb-1">{obj.title}</p>
                              <p className="text-sm">{obj.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="px-8 pb-8">
              <button onClick={copy}
                className="w-full py-4 rounded-2xl border-2 font-semibold text-base transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  borderColor: copied ? '#10B981' : 'var(--color-alan-border)',
                  color: copied ? '#10B981' : 'var(--color-alan-text)',
                  backgroundColor: copied ? '#ECFDF5' : '#FFFFFF',
                }}>
                {copied ? (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Copied</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy content</>
                )}
              </button>
            </div>
          </div>

          {/* Validate + XP */}
          <div className="rounded-[20px] border-2 px-8 py-8 mb-8"
            style={{ borderColor: validated ? cat.color : 'var(--color-alan-border)', backgroundColor: validated ? cat.bg : '#FAFAFA' }}>

            {!validated ? (
              <>
                <p className="font-bold text-[1.1rem] mb-2" style={{color: 'var(--color-alan-text)'}}>Mark as done to earn XP</p>
                <p className="text-[0.95rem] mb-6" style={{color: 'var(--color-alan-text-light)'}}>Complete this content and validate to gain <strong>{result.xp ?? 100} XP</strong> and progress towards your next level.</p>
                <button onClick={validate}
                  className="w-full py-5 rounded-2xl font-bold text-[1.05rem] cursor-pointer transition-all duration-150"
                  style={{ backgroundColor: cat.color, color: '#FFFFFF' }}>
                  ✓ Validate — +{result.xp ?? 100} XP
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-bold text-[1.1rem] mb-1" style={{color: cat.color}}>
                      {levelUp ? `Level up! You're now Level ${level} 🎉` : `+${result.xp ?? 100} XP earned!`}
                    </p>
                    <p className="text-[0.9rem]" style={{color: 'var(--color-alan-text-light)'}}>Level {level} · {xpInLevel} / {XP_PER_LEVEL} XP</p>
                  </div>
                  <span className="font-bold text-[1.8rem]" style={{color: cat.color}}>Lv.{level}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{backgroundColor: 'var(--color-alan-border)'}}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${xpProgress}%`, backgroundColor: cat.color }} />
                </div>
              </>
            )}
          </div>

          {/* Quality scores */}
          <div className="rounded-[20px] border-2 px-8 py-8 mb-8" style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FAFAFA'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-8" style={{color: 'var(--color-alan-text-light)'}}>Quality assessment</p>
            <div className="flex flex-col gap-6">
              {Object.entries(SCORE_META).map(([key, m]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[0.95rem] font-medium" style={{color: 'var(--color-alan-text)'}}>{m.label}</span>
                    <span className="text-[0.95rem] font-bold" style={{color: m.color}}>{result.scores?.[key as keyof typeof result.scores] ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{backgroundColor: 'var(--color-alan-border)'}}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{width: `${result.scores?.[key as keyof typeof result.scores] ?? 0}%`, backgroundColor: m.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={restart}
            className="w-full py-5 rounded-2xl border-2 text-base font-semibold transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text)', backgroundColor: '#FAFAFA'}}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F4FF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}>
            Create new content
          </button>

        </div>
      </div>
    </div>
  )
}
