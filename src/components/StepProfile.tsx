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
      <h2 className="text-[1.6rem] font-bold tracking-tight text-[#111117] mb-1.5">Choose a profile</h2>
      <p className="text-[0.9rem] text-[#8A8A95] leading-relaxed mb-8">
        Mo will personalize the content based on this user's health data.
      </p>

      <div className="grid grid-cols-4 gap-3">
        {PROFILES.map(p => (
          <button
            key={p.id}
            onClick={() => next({ profileId: p.id })}
            className="group flex flex-col items-center justify-center text-center px-4 py-7 rounded-2xl border border-[#EBEBEF] bg-white hover:border-[#5C58F6] hover:bg-[#F5F4FF] transition-all duration-150 cursor-pointer min-h-[110px]"
          >
            <p className="font-semibold text-[0.85rem] text-[#111117] leading-snug mb-1 group-hover:text-[#5C58F6] transition-colors">{p.label}</p>
            <p className="text-[0.75rem] text-[#B0B0BB]">{p.source}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
