'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisResult } from '../types';

const SCORE_META = {
  medical:         { label: 'Medical accuracy', color: '#10B981' }, // Greenish for medical
  brand:           { label: 'Mo · Alan Voice',     color: 'var(--color-alan-blue)' },
  personalization: { label: 'Personalization',   color: '#F59E0B' }, // Yellowish/Orange
} as const;

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mo-result')
    if (saved) {
      setResult(JSON.parse(saved))
    } else {
      router.push('/')
    }
  }, [router])

  const copy = () => {
    if (typeof window !== 'undefined' && result?.body) {
      navigator.clipboard.writeText(result.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const restart = () => {
    localStorage.removeItem('mo-result')
    router.push('/')
  }

  if (!result) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-white px-6 py-20 flex flex-col items-center">
      <div className="w-full max-w-[800px] mx-auto">
        
        {/* Brand */}
        <header className="mb-16 fade-up text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <img src="/alan-logo.png" alt="Alan Logo" className="h-[52px] w-auto" />
            <span className="font-extrabold text-[1.6rem] tracking-tight leading-none pt-2" style={{color: 'var(--color-alan-text)'}}>Mo Studios</span>
          </div>
        </header>

        <div className="fade-up">
          {/* Content card */}
          <div className="rounded-[24px] border overflow-hidden mb-8 shadow-sm" style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}>
            <div className="px-6 pt-6 pb-5" style={{borderBottom: '1px solid var(--color-alan-border)'}}>
              <h2 className="font-bold leading-snug text-2xl" style={{color: 'var(--color-alan-text)'}}>{result?.title}</h2>
            </div>
            <div className="px-6 py-6 text-lg leading-relaxed whitespace-pre-wrap" style={{color: 'var(--color-alan-text)'}}>
               {result?.body.split('\n').map((line, i) => {
                 // Check for headers
                 if (line.startsWith('# ')) {
                   return <h1 key={i} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{line.slice(2)}</h1>;
                 }
                 if (line.startsWith('## ')) {
                   return <h2 key={i} className="text-2xl font-bold mb-5 mt-7 first:mt-0">{line.slice(3)}</h2>;
                 }
                 if (line.startsWith('### ')) {
                   return <h3 key={i} className="text-xl font-bold mb-4 mt-6 first:mt-0">{line.slice(4)}</h3>;
                 }
                 
                 // Check for list items
                 if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    const content = line.trim().slice(2);
                    const parts = content.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={i} className="flex gap-3 mb-3 ml-2">
                        <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-alan-blue)]" />
                        <p>
                          {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      </div>
                    );
                 }

                 // Check for numbered lists
                 const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
                 if (numberedMatch) {
                    const number = numberedMatch[1];
                    const content = numberedMatch[2];
                    const parts = content.split(/(\*\*.*?\*\*)/g);
                    return (
                      <div key={i} className="flex gap-3 mb-3 ml-2">
                        <span className="shrink-0 font-bold text-[var(--color-alan-blue)]">{number}.</span>
                        <p>
                          {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      </div>
                    );
                 }

                 if (line.trim() === '') return <div key={i} className="h-4" />;

                 // Handle regular paragraphs with bold
                 const parts = line.split(/(\*\*.*?\*\*)/g);
                 return (
                   <p key={i} className="mb-5 last:mb-0">
                     {parts.map((part, j) => {
                       if (part.startsWith('**') && part.endsWith('**')) {
                         return <strong key={j}>{part.slice(2, -2)}</strong>;
                       }
                       return part;
                     })}
                   </p>
                 );
               })}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={copy}
                className="w-full py-4 rounded-2xl border font-semibold text-base transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  borderColor: copied ? '#10B981' : 'var(--color-alan-border)',
                  color: copied ? '#10B981' : 'var(--color-alan-text)',
                  backgroundColor: copied ? '#ECFDF5' : '#FFFFFF',
                }}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Copied to clipboard
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quality scores */}
          <div className="rounded-[24px] border px-6 py-6 mb-8 shadow-sm" style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}>
            <p className="text-sm font-bold uppercase tracking-wider mb-6" style={{color: 'var(--color-alan-text-light)'}}>Quality assessment</p>
            <div className="flex flex-col gap-5">
              {Object.entries(SCORE_META).map(([key, m]) => (
                <div key={key}>
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-medium" style={{color: 'var(--color-alan-text)'}}>{m.label}</span>
                    <span className="text-base font-bold" style={{color: m.color}}>{result?.scores?.[key as keyof typeof result.scores] ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{width: `${result?.scores?.[key as keyof typeof result.scores] ?? 0}%`, backgroundColor: m.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Alan style */}
          <div className="flex items-start gap-4 p-5 rounded-2xl mb-8 bg-gray-50 border border-gray-100">
            <svg className="shrink-0 mt-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-alan-text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <p className="text-sm leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
              This content was generated by Mo and vetted by the Alan medical team. It does not replace personalized medical advice.
            </p>
          </div>

          <button
            onClick={restart}
            className="w-full py-4 rounded-2xl border text-base font-semibold transition-all duration-150 cursor-pointer hover:bg-gray-50 bg-white"
            style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text)'}}
          >
            Create new content
          </button>
        </div>
      </div>
    </div>
  )
}
