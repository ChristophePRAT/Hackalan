'use client';

import { StepProps } from '../types';
import { PROFILES } from '../constants';

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
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#8A8A95] mb-1.5">{p.name}</p>
            <p className="font-semibold text-[0.85rem] text-[#111117] leading-snug mb-1 group-hover:text-[#5C58F6] transition-colors">{p.label}</p>
            <p className="text-[0.75rem] text-[#B0B0BB]">{p.source}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
