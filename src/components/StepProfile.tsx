'use client';

import { StepProps } from '../types';

const PROFILES = [
  { id: 'a463e0bf26d790d6afdfda0cfd161cf5', label: 'IT Manager',            source: 'Withings' },
  { id: '2bfaa7e6f9455ceafa0a59fd5b80496c', label: 'Active Gym Guy',         source: 'Whoop' },
  { id: '7f82fc3b0abba3a86b5e15c911fc5f6e', label: 'Moderate Student',       source: 'Samsung · Oura · Withings' },
  { id: '65b1357f1ceb98f51de05d1cbeb81532', label: 'Our CPO',                source: 'Withings' },
  { id: '1e2e53da12e0a9aebb3750af3c5857e1', label: 'Sedentary Techie',       source: 'Apple' },
  { id: '26158117728afa6083c58c958eed5d89', label: 'Moderate Techie',        source: 'Samsung' },
  { id: 'eb634efc4ac80c9ed6a355c8a99adb83', label: 'Active Tennis Player',   source: 'Garmin' },
  { id: '79187771a36482f013203b32712e873d', label: 'Senior · Heart Patient', source: 'Withings' },
] as const;

export default function StepProfile({ next }: StepProps) {
  return (
    <div>
      <h2 className="font-bold leading-tight mb-4 text-[2rem] tracking-tight" style={{color: 'var(--color-alan-text)'}}>
        Choose a profile
      </h2>
      <p className="text-[1.05rem] mb-12 leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
        Mo will personalize the content based on this user's health data.
      </p>

      <div className="grid grid-cols-4 gap-4">
        {PROFILES.map(p => (
          <button
            key={p.id}
            onClick={() => next({ profileId: p.id })}
            className="flex flex-col items-center justify-center text-center px-8 py-10 rounded-[20px] border-2 transition-all duration-150 cursor-pointer min-h-[140px]"
            style={{
              borderColor: 'var(--color-alan-border)',
              backgroundColor: '#FAFAFA',
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
            <p className="font-bold text-[0.95rem] mb-1.5 leading-snug" style={{color: 'var(--color-alan-text)'}}>{p.label}</p>
            <p className="text-[0.78rem] font-medium" style={{color: 'var(--color-alan-text-light)'}}>{p.source}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
