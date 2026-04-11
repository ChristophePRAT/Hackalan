'use client';

import { StepProps } from '../types';

const GOALS = [
  { id: 'sleep',     label: 'Sleep',            sub: 'Sleep better, wake up refreshed',       xp: 120 },
  { id: 'stress',    label: 'Stress',           sub: 'Find a lasting state of calm',          xp: 100 },
  { id: 'detox',     label: 'Digital detox',    sub: 'Regain control of your attention',      xp: 90  },
  { id: 'nutrition', label: 'Nutrition',        sub: 'Eat better, without deprivation',       xp: 110 },
  { id: 'tobacco',   label: 'Manage tobacco',   sub: 'Make progress at your own pace',        xp: 150 },
  { id: 'breathing', label: 'Breathing',        sub: 'A technique, a habit, a breath',        xp: 80  },
] as const;

export default function StepGoal({ next }: Pick<StepProps, 'next'>) {
  return (
    <div>
      <h2 className="font-semibold leading-tight mb-3 text-3xl" style={{color: 'var(--color-alan-text)'}}>
        What are you working on?
      </h2>
      <p className="text-base mb-10 leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
        Mo adapts every piece of content to your situation and health journey.
      </p>

      <div className="grid grid-cols-2 gap-5">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => next({ goal: g.id })}
            className="group relative text-left p-6 md:p-8 rounded-[24px] border transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-alan-blue)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(92, 88, 246, 0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-alan-border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <p className="font-semibold mb-2 text-[1.1rem]" style={{color: 'var(--color-alan-text)'}}>{g.label}</p>
            <p className="text-[0.9rem] leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>{g.sub}</p>
            <span className="absolute top-5 right-5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{color: 'var(--color-alan-blue)'}}>
              +{g.xp} XP
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
