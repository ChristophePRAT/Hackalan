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
      <h2 className="font-bold leading-tight mb-4 text-[2rem]" style={{color: 'var(--color-alan-text)'}}>
        What are you working on?
      </h2>
      <p className="text-[1.05rem] mb-12 leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
        Mo adapts every piece of content to your situation and health journey.
      </p>

      <div className="grid grid-cols-2 gap-5">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => next({ goal: g.id })}
            className="group relative text-left px-10 py-10 rounded-[20px] border-2 transition-all duration-150 cursor-pointer"
            style={{
              borderColor: 'var(--color-alan-border)',
              backgroundColor: '#FAFAFA',
              minHeight: '110px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-alan-blue)';
              e.currentTarget.style.backgroundColor = '#F5F4FF';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(92, 88, 246, 0.10)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-alan-border)';
              e.currentTarget.style.backgroundColor = '#FAFAFA';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p className="font-bold mb-2 text-[1.2rem] tracking-tight" style={{color: 'var(--color-alan-text)'}}>{g.label}</p>
            <p className="text-[0.95rem] leading-relaxed pr-12" style={{color: 'var(--color-alan-text-light)'}}>{g.sub}</p>
            <span className="absolute top-5 right-5 text-[0.75rem] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded-full" style={{color: 'var(--color-alan-blue)', backgroundColor: 'rgba(92,88,246,0.1)'}}>
              +{g.xp} XP
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
