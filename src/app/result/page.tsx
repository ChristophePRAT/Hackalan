'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisResult } from '../../types';
import { CATEGORIES, XP_PER_LEVEL } from '../../constants';

const SCORE_META = {
  medical:         { label: 'Medical accuracy', color: '#10B981' },
  brand:           { label: 'Mo · Alan Voice',  color: '#5C58F6' },
  personalization: { label: 'Personalization',  color: '#F59E0B' },
} as const;

function getCat(label?: string) {
  return CATEGORIES.find(c => c.label === label) ?? { label: label ?? 'Health', color: '#5C58F6', bg: '#F0EFFF' }
}

function renderBody(body: string, accentColor: string) {
  return body.split('\n').map((line, i) => {
    if (line.startsWith('# '))   return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 first:mt-0">{line.slice(2)}</h1>
    if (line.startsWith('## '))  return <h2 key={i} className="text-xl font-bold mt-5 mb-2 first:mt-0">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 first:mt-0">{line.slice(4)}</h3>
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const parts = line.trim().slice(2).split(/(\*\*.*?\*\*)/g)
      return (
        <div key={i} className="flex gap-3 mb-2 ml-1">
          <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <p className="text-sm leading-relaxed text-[#191919]">
            {parts.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p)}
          </p>
        </div>
      )
    }
    const num = line.trim().match(/^(\d+)\.\s+(.*)/)
    if (num) {
      const parts = num[2].split(/(\*\*.*?\*\*)/g)
      return (
        <div key={i} className="flex gap-3 mb-2 ml-1">
          <span className="shrink-0 font-bold text-sm" style={{ color: accentColor }}>{num[1]}.</span>
          <p className="text-sm leading-relaxed text-[#191919]">
            {parts.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p)}
          </p>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-3" />
    const parts = line.split(/(\*\*.*?\*\*)/g)
    return (
      <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed text-[#191919]">
        {parts.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p)}
      </p>
    )
  })
}

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult]       = useState<AnalysisResult | null>(null)
  const [copied, setCopied]       = useState(false)
  const [validated, setValidated] = useState(false)
  const [totalXp, setTotalXp]     = useState(0)
  const [levelUp, setLevelUp]     = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mo-result')
    if (saved) setResult(JSON.parse(saved))
    else router.push('/')
    setTotalXp(parseInt(localStorage.getItem('mo-total-xp') ?? '0', 10))
  }, [router])

  const copy = () => {
    if (result?.body) { navigator.clipboard.writeText(result.body); setCopied(true); setTimeout(() => setCopied(false), 2200) }
  }

  const validate = () => {
    if (validated) return
    const earned = result?.xp ?? 100
    const next = totalXp + earned
    const prevLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1
    const nextLevel = Math.floor(next / XP_PER_LEVEL) + 1
    localStorage.setItem('mo-total-xp', String(next))
    setTotalXp(next)
    setValidated(true)
    if (nextLevel > prevLevel) setLevelUp(true)
  }

  const restart = () => { localStorage.removeItem('mo-result'); router.push('/') }

  if (!result) return <div className="min-h-screen flex items-center justify-center text-[#6E6E73]">Loading...</div>

  const cat        = getCat(result.category)
  const level      = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpInLevel  = totalXp % XP_PER_LEVEL
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100

  return (
    <div className="min-h-screen bg-[#F4F4F6] px-6 py-16 flex flex-col items-center">
      <div className="w-full max-w-[900px] mx-auto">

        {/* Brand */}
        <header className="mb-8 fade-up text-center">
          <div className="inline-flex items-center gap-3">
            <img src="/alan-logo.png" alt="Alan Logo" className="h-12 w-auto" />
            <span className="font-extrabold text-2xl tracking-tight text-[#191919]">Mo Studios</span>
          </div>
        </header>

        <div className="bg-white rounded-3xl border border-[#E4E4E9] shadow-sm overflow-hidden fade-up">
          <div className="p-8 sm:p-10">

            {/* Category + XP */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
                style={{ backgroundColor: cat.bg, color: cat.color }}>
                {cat.label}
              </span>
              <span className="text-xs font-bold text-[#AFAFB8]">+{result.xp ?? 100} XP to earn</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-[#191919] mb-6">{result.title}</h1>

            {/* Body */}
            <div className="mb-6">
              {renderBody(result.body, cat.color)}
            </div>

            {/* Copy */}
            <button onClick={copy}
              className="w-full py-3.5 rounded-xl border font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mb-8"
              style={{
                borderColor: copied ? '#10B981' : '#E4E4E9',
                color: copied ? '#10B981' : '#6E6E73',
                backgroundColor: copied ? '#ECFDF5' : '#F7F7F9',
              }}>
              {copied
                ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Copied</>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy content</>
              }
            </button>

            {/* Divider */}
            <div className="border-t border-[#E4E4E9] mb-8" />

            {/* Validate / XP */}
            <div className="rounded-2xl border p-6 mb-8 transition-all duration-300"
              style={{ borderColor: validated ? cat.color + '60' : '#E4E4E9', backgroundColor: validated ? cat.bg : '#F7F7F9' }}>
              {!validated ? (
                <>
                  <p className="font-bold text-base text-[#191919] mb-1">Mark as done to earn XP</p>
                  <p className="text-sm text-[#6E6E73] mb-5">Validate to gain <strong>{result.xp ?? 100} XP</strong> and progress towards your next level.</p>
                  <button onClick={validate}
                    className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all duration-150 cursor-pointer"
                    style={{ backgroundColor: cat.color }}>
                    ✓ Validate — +{result.xp ?? 100} XP
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-base mb-0.5" style={{ color: cat.color }}>
                        {levelUp ? `Level up! You're now Level ${level} 🎉` : `+${result.xp ?? 100} XP earned!`}
                      </p>
                      <p className="text-xs text-[#6E6E73]">Level {level} · {xpInLevel} / {XP_PER_LEVEL} XP</p>
                    </div>
                    <span className="font-bold text-2xl" style={{ color: cat.color }}>Lv.{level}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E4E4E9] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${xpProgress}%`, backgroundColor: cat.color }} />
                  </div>
                </>
              )}
            </div>

            {/* Scores */}
            <div className="rounded-2xl border border-[#E4E4E9] bg-[#F7F7F9] p-6 mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#AFAFB8] mb-6">Quality assessment</p>
              <div className="flex flex-col gap-5">
                {Object.entries(SCORE_META).map(([key, m]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#191919]">{m.label}</span>
                      <span className="text-sm font-bold" style={{ color: m.color }}>{result.scores?.[key as keyof typeof result.scores] ?? 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E4E4E9] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${result.scores?.[key as keyof typeof result.scores] ?? 0}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-[#F7F7F9] border border-[#E4E4E9] mb-8">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AFAFB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                This content was generated by Mo and vetted by the Alan medical team. It does not replace personalized medical advice.
              </p>
            </div>

            <button onClick={restart}
              className="w-full py-4 rounded-xl border border-[#E4E4E9] bg-[#F7F7F9] hover:bg-[#F0EFFF] hover:border-[#5C58F6] text-sm font-semibold text-[#6E6E73] hover:text-[#5C58F6] transition-all duration-150 cursor-pointer">
              Create new content
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
