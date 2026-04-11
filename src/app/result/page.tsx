"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "../../types";
import { CATEGORIES, XP_PER_LEVEL } from "../../constants";

function getCat(label?: string) {
    return (
        CATEGORIES.find((c) => c.label === label) ?? {
            label: label ?? "Health",
            color: "#5C58F6",
            bg: "#F5F4FF",
        }
    );
}

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [completed, setCompleted] = useState<Set<number>>(new Set());
    const [baseXp, setBaseXp] = useState(0);
    const [levelUp, setLevelUp] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("mo-result");
        if (saved) setResult(JSON.parse(saved));
        else router.push("/");
        setBaseXp(parseInt(localStorage.getItem("mo-total-xp") ?? "0", 10));
    }, [router]);

    const objectives = result?.objectives ?? [];
    const earnedXp = objectives
        .filter((_, i) => completed.has(i))
        .reduce((sum, o) => sum + (o.xp ?? 100), 0);
    const totalXp = baseXp + earnedXp;
    const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const xpInLevel = totalXp % XP_PER_LEVEL;
    const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

    const markDone = (idx: number) => {
        if (completed.has(idx)) return;
        const obj = objectives[idx];
        const xpGain = obj?.xp ?? 100;
        const prevTotal = baseXp + earnedXp;
        const nextTotal = prevTotal + xpGain;
        if (Math.floor(nextTotal / XP_PER_LEVEL) > Math.floor(prevTotal / XP_PER_LEVEL)) {
            setLevelUp(true);
            setTimeout(() => setLevelUp(false), 3000);
        }
        const next = new Set(completed);
        next.add(idx);
        setCompleted(next);
        localStorage.setItem("mo-total-xp", String(nextTotal));
    };

    if (!result)
        return (
            <div className="min-h-screen flex items-center justify-center text-[#8A8A95] text-sm">
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-white">
            {/* Level-up toast */}
            {levelUp && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#5C58F6] text-white font-semibold text-sm shadow-lg animate-bounce">
                    Level up! Now Level {level}
                </div>
            )}

            {/* Header */}
            <header className="border-b border-[#EBEBEF] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/alan-logo.png" alt="Alan" className="h-8 w-auto" />
                    <span className="font-extrabold text-[1.1rem] tracking-tight text-[#111117]">Mo Studios</span>
                </div>
                {/* XP chip in header (mobile) */}
                <div className="flex items-center gap-2 lg:hidden">
                    <div className="text-right">
                        <p className="text-[0.7rem] font-bold text-[#5C58F6]">Lv.{level}</p>
                        <p className="text-[0.65rem] text-[#8A8A95]">{xpInLevel}/{XP_PER_LEVEL} XP</p>
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-[#EBEBEF] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${xpProgress}%`, backgroundColor: '#5C58F6' }}
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-[960px] mx-auto px-6 py-10 flex gap-8 items-start">
                {/* ── Main content ── */}
                <div className="flex-1 min-w-0 space-y-10">

                    {/* Explanation sections */}
                    {result.explanation && result.explanation.length > 0 && (
                        <section className="space-y-5">
                            {result.explanation.map((exp, i) => (
                                <div key={i} className={`rounded-2xl border border-[#EBEBEF] overflow-hidden ${i === 0 ? 'bg-[#F5F4FF]' : 'bg-[#FAFAFA]'}`}>
                                    <div className="px-6 pt-6 pb-4">
                                        <h2 className="text-[1.05rem] font-bold text-[#111117] leading-snug">{exp.title}</h2>
                                    </div>
                                    <div className="px-6 pb-6">
                                        <p className="text-[0.875rem] text-[#374151] leading-relaxed whitespace-pre-line">{exp.paragraph}</p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Objectives */}
                    {objectives.length > 0 && (
                        <section>
                            <h2 className="text-[1.3rem] font-bold text-[#111117] mb-4">Your objectives</h2>
                            <div className="space-y-3">
                                {objectives.map((obj, i) => {
                                    const cat = getCat(obj.category);
                                    const done = completed.has(i);
                                    return (
                                        <div
                                            key={i}
                                            className="rounded-2xl border-2 transition-all duration-300 overflow-hidden"
                                            style={{
                                                borderColor: done ? cat.color : cat.color + '30',
                                                backgroundColor: done ? cat.bg : '#FAFAFA',
                                            }}
                                        >
                                            <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => markDone(i)}
                                                    disabled={done}
                                                    className="shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-default"
                                                    style={{
                                                        borderColor: done ? cat.color : '#CBCBD4',
                                                        backgroundColor: done ? cat.color : 'white',
                                                    }}
                                                >
                                                    {done && (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        {/* Category pill */}
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
                                                            style={{ backgroundColor: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
                                                        >
                                                            {cat.label}
                                                        </span>
                                                        {/* XP badge */}
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
                                                            style={{ backgroundColor: done ? cat.color + '20' : '#F5F4FF', color: done ? cat.color : '#5C58F6' }}
                                                        >
                                                            +{obj.xp ?? 100} XP
                                                        </span>
                                                    </div>
                                                    <p className={`font-semibold text-[0.925rem] leading-snug mb-1.5 ${done ? 'line-through opacity-60' : 'text-[#111117]'}`}>
                                                        {obj.title}
                                                    </p>
                                                    <p className={`text-[0.8rem] leading-relaxed ${done ? 'opacity-50' : 'text-[#8A8A95]'}`}>
                                                        {obj.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {!done && (
                                                <div className="px-5 pb-4">
                                                    <button
                                                        onClick={() => markDone(i)}
                                                        className="w-full py-2.5 rounded-xl text-[0.8rem] font-semibold text-white transition-all duration-150 cursor-pointer"
                                                        style={{ backgroundColor: cat.color }}
                                                    >
                                                        Mark as done — +{obj.xp ?? 100} XP
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

<p className="text-[0.75rem] text-[#B0B0BB] leading-relaxed text-center px-2">
                        Generated by Mo, vetted by the Alan medical team. Does not replace professional medical advice.
                    </p>

                    <button
                        onClick={() => { localStorage.removeItem("mo-result"); router.push("/"); }}
                        className="w-full py-3.5 rounded-xl border border-[#EBEBEF] bg-white hover:bg-[#F5F4FF] hover:border-[#5C58F6] hover:text-[#5C58F6] text-[0.875rem] font-semibold text-[#8A8A95] transition-all duration-150 cursor-pointer"
                    >
                        Create new content
                    </button>
                </div>

                {/* ── Sticky sidebar ── */}
                <aside className="hidden lg:block w-[260px] shrink-0 sticky top-10 space-y-4">
                    {/* XP card */}
                    <div className="rounded-2xl border border-[#EBEBEF] bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#C0C0C8] mb-0.5">Your level</p>
                                <p className="text-[1.4rem] font-extrabold text-[#111117] leading-none">Lv.{level}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#F5F4FF] flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C58F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="h-2 rounded-full bg-[#EBEBEF] overflow-hidden mb-2">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${xpProgress}%`, backgroundColor: '#5C58F6' }}
                            />
                        </div>
                        <p className="text-[0.7rem] text-[#8A8A95]">{xpInLevel} / {XP_PER_LEVEL} XP · {XP_PER_LEVEL - xpInLevel} XP to next level</p>
                        {earnedXp > 0 && (
                            <p className="text-[0.7rem] font-bold text-[#5C58F6] mt-1">+{earnedXp} XP earned this session</p>
                        )}
                    </div>

                    {/* Objectives checklist */}
                    {objectives.length > 0 && (
                        <div className="rounded-2xl border border-[#EBEBEF] bg-white p-5">
                            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#C0C0C8] mb-3">
                                Objectives ({completed.size}/{objectives.length})
                            </p>
                            <div className="space-y-2.5">
                                {objectives.map((obj, i) => {
                                    const cat = getCat(obj.category);
                                    const done = completed.has(i);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => markDone(i)}
                                            disabled={done}
                                            className="w-full flex items-start gap-2.5 text-left cursor-pointer disabled:cursor-default group"
                                        >
                                            <div
                                                className="shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                                                style={{
                                                    borderColor: done ? cat.color : '#CBCBD4',
                                                    backgroundColor: done ? cat.color : 'transparent',
                                                }}
                                            >
                                                {done && (
                                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-[0.78rem] leading-snug font-medium ${done ? 'line-through opacity-50 text-[#8A8A95]' : 'text-[#111117] group-hover:text-[#5C58F6]'} transition-colors`}>
                                                    {obj.title}
                                                </p>
                                                <p className="text-[0.68rem] font-bold mt-0.5" style={{ color: cat.color }}>
                                                    +{obj.xp ?? 100} XP
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {completed.size === objectives.length && objectives.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#EBEBEF] text-center">
                                    <p className="text-[0.8rem] font-bold text-[#5C58F6]">All objectives done!</p>
                                    <p className="text-[0.7rem] text-[#8A8A95] mt-0.5">+{earnedXp} XP total</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
