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
      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        Choose a profile
      </h2>
      <p className="text-base text-[#6E6E73] leading-relaxed mb-8">
        Mo will personalize the content based on this user's health data.
      </p>

      <div className="grid grid-cols-4 gap-3">
        {PROFILES.map(p => (
          <button
            key={p.id}
            onClick={() => next({ profileId: p.id })}
            className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-[#E4E4E9] bg-[#F7F7F9] hover:border-[#5C58F6] hover:bg-[#F0EFFF] transition-all duration-150 cursor-pointer min-h-[120px]"
          >
            <p className="font-semibold text-sm text-[#191919] leading-snug mb-1">{p.label}</p>
            <p className="text-xs text-[#6E6E73]">{p.source}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
