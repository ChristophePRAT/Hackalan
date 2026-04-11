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

type AudioState = "idle" | "loading" | "ready" | "error";

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [completed, setCompleted] = useState<Set<number>>(new Set());
    const [baseXp, setBaseXp] = useState(0);
    const [levelUp, setLevelUp] = useState(false);
    const [generatingAudio, setGeneratingAudio] = useState(false);

    const [audioState, setAudioState] = useState<AudioState>("idle");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [coachScript, setCoachScript] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("mo-result");
        if (saved) setResult(JSON.parse(saved));
        else router.push("/");
        setBaseXp(parseInt(localStorage.getItem("mo-total-xp") ?? "0", 10));
    }, [router]);

    useEffect(() => {
        if (!result?.voiceScript) return;
        // Store voiceScript for fallback display
        setCoachScript(result.voiceScript);
    }, [result]);

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
        if (
            Math.floor(nextTotal / XP_PER_LEVEL) >
            Math.floor(prevTotal / XP_PER_LEVEL)
        ) {
            setLevelUp(true);
            setTimeout(() => setLevelUp(false), 3000);
        }
        const next = new Set(completed);
        next.add(idx);
        setCompleted(next);
        localStorage.setItem("mo-total-xp", String(nextTotal));
    };

    const generateAudio = async () => {
        if (!result?.voiceScript) return;

        // If audio is already available, just play it
        if (audioUrl && audioState === "ready") {
            const audio = new Audio(audioUrl);
            audio.play();
            return;
        }

        setGeneratingAudio(true);
        try {
            const response = await fetch("/api/audio-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ generatedContent: result.voiceScript }),
            });

            if (!response.ok) {
                throw new Error(
                    `Audio generation failed with status ${response.status}`,
                );
            }

            const data = await response.json();
            if (data.audioUrl) {
                setAudioUrl(data.audioUrl);
                setAudioState("ready");

                // Play the audio
                const audio = new Audio(data.audioUrl);
                audio.play();
            } else {
                setAudioState("error");
            }
        } catch (error) {
            console.error("Audio generation failed:", error);
            setAudioState("error");
        } finally {
            setGeneratingAudio(false);
        }
    };

    if (!result)
        return (
            <div className="min-h-screen flex items-center justify-center text-[#8A8A95] text-sm">
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-white">
            {levelUp && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#5C58F6] text-white font-semibold text-sm shadow-lg animate-bounce">
                    Level up! Now Level {level}
                </div>
            )}

            <header className="border-b border-[#EBEBEF] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/alan-logo.png"
                        alt="Alan"
                        className="h-8 w-auto"
                    />
                    <span className="font-extrabold text-[1.1rem] tracking-tight text-[#111117]">
                        Mo Studios
                    </span>
                </div>
                <div className="flex items-center gap-2.5 lg:hidden rounded-full bg-[#F5F4FF] px-3 py-1.5">
                    <p className="text-sm font-extrabold text-[#5C58F6]">
                        Lv.{level}
                    </p>
                    <div className="w-28 h-2 rounded-full bg-[#EBEBEF] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${xpProgress}%`,
                                backgroundColor: "#5C58F6",
                            }}
                        />
                    </div>
                    <p className="text-[0.65rem] text-[#8A8A95] font-medium">
                        {xpInLevel}/{XP_PER_LEVEL}
                    </p>
                </div>
            </header>

            {/* Hero Summary Banner */}
            <div className="bg-[#F5F4FF] border-b border-[#EBEBEF] px-6 py-7">
                <div className="max-w-[960px] mx-auto flex items-center justify-between gap-6">
                    <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8A8A95] mb-2">
                            Your analysis
                        </p>
                        <h1 className="text-[1.25rem] font-extrabold text-[#111117] leading-snug mb-2">
                            {result.explanation?.[0]?.title ||
                                "Your health plan is ready"}
                        </h1>
                        <p className="text-[0.8rem] text-[#8A8A95]">
                            {objectives.length} objectives ·{" "}
                            {objectives.reduce(
                                (sum, o) => sum + (o.xp ?? 100),
                                0,
                            )}{" "}
                            XP available
                        </p>
                    </div>
                    <img
                        src="/mbappe.jpeg"
                        alt="Mo Coach"
                        className="hidden sm:block h-32 w-32 rounded-xl object-cover shrink-0"
                        style={{
                            boxShadow: "0 0 0 2px rgba(92, 88, 246, 0.2)",
                        }}
                    />
                </div>
            </div>

            <div className="max-w-[960px] mx-auto px-6 py-10 flex gap-8 items-start">
                <div className="flex-1 min-w-0 space-y-10">
                    {result.explanation && result.explanation.length > 0 && (
                        <section className="space-y-5">
                            {result.explanation.map((exp, i) => (
                                <div
                                    key={i}
                                    className={`rounded-2xl overflow-hidden relative ${
                                        i === 0
                                            ? "bg-[#F5F4FF] shadow-sm"
                                            : "bg-white border border-[#EBEBEF]"
                                    }`}
                                >
                                    {i === 0 && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C58F6] rounded-l-2xl" />
                                    )}
                                    <div
                                        className={`px-6 pt-6 pb-4 ${i === 0 ? "pl-7" : ""}`}
                                    >
                                        <h2
                                            className={`${
                                                i === 0
                                                    ? "text-[1.15rem] font-extrabold"
                                                    : "text-[0.95rem] font-bold"
                                            } text-[#111117] leading-snug`}
                                        >
                                            {exp.title}
                                        </h2>
                                    </div>
                                    <div
                                        className={`px-6 pb-6 ${i === 0 ? "pl-7" : ""}`}
                                    >
                                        <p
                                            className={`${
                                                i === 0
                                                    ? "text-[0.9rem]"
                                                    : "text-[0.85rem]"
                                            } ${i === 0 ? "text-[#374151]" : "text-[#6B7280]"} leading-relaxed whitespace-pre-line`}
                                        >
                                            {exp.paragraph}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Audio Coach */}
                    <div className="rounded-2xl border border-[#5C58F6]/20 bg-[#F5F4FF] p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/mbappe.jpeg"
                                    alt="Mo Coach"
                                    className="h-16 w-16 rounded-xl object-cover shrink-0"
                                />
                                <div>
                                    <p className="text-sm font-bold text-[#111117]">
                                        Mo, your audio coach
                                    </p>
                                    <p className="text-xs text-[#8A8A95]">
                                        Listen to your daily brief
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={generateAudio}
                                disabled={generatingAudio}
                                className="rounded-full px-4 py-2 bg-[#5C58F6] hover:bg-[#4F4AD9] disabled:bg-[#9492F9] disabled:cursor-not-allowed text-white text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shrink-0"
                            >
                                {generatingAudio ? (
                                    <>
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="animate-spin"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2a10 10 0 0 1 0 20" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : audioState === "ready" ? (
                                    <>
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        Play again
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 1v22M4.22 4.22a8 8 0 1 1 11.56 11.56M4.22 19.78a8 8 0 0 0 11.56-11.56" />
                                        </svg>
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>

                        {audioState === "loading" && (
                            <div className="flex items-center gap-3 py-3">
                                <div
                                    className="w-4 h-4 rounded-full border-2 animate-spin"
                                    style={{
                                        borderColor: "#5C58F6",
                                        borderTopColor: "transparent",
                                    }}
                                />
                                <p className="text-sm text-[#6E6E73]">
                                    Generating your audio coach...
                                </p>
                                <img
                                    src="/mbappe+founders.png"
                                    alt="Coach"
                                    className="h-16 w-16 rounded-lg object-cover ml-auto shrink-0 animate-bounce"
                                />
                            </div>
                        )}

                        {audioState === "ready" && audioUrl && (
                            <audio
                                controls
                                src={audioUrl}
                                className="w-full rounded-lg"
                                preload="auto"
                            />
                        )}

                        {audioState === "error" && coachScript && (
                            <div className="bg-white rounded-xl border border-[#E4E4E9] px-5 py-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#AFAFB8] mb-2">
                                    Your daily coach script
                                </p>
                                <p className="text-sm leading-relaxed text-[#191919]">
                                    {coachScript}
                                </p>
                            </div>
                        )}

                        {audioState === "error" && !coachScript && (
                            <p className="text-sm text-[#6E6E73]">
                                Audio generation unavailable. Try again later.
                            </p>
                        )}
                    </div>

                    {objectives.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-[1.3rem] font-bold text-[#111117]">
                                    Your objectives
                                </h2>
                                <div className="rounded-full bg-[#F5F4FF] px-3 py-1 border border-[#5C58F6]/20">
                                    <p className="text-[0.72rem] font-bold text-[#5C58F6]">
                                        {completed.size}/{objectives.length}{" "}
                                        done
                                        {earnedXp > 0 && (
                                            <> · +{earnedXp} XP earned</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {objectives.map((obj, i) => {
                                    const cat = getCat(obj.category);
                                    const done = completed.has(i);
                                    return (
                                        <div
                                            key={i}
                                            className="rounded-2xl border-2 transition-all duration-300 overflow-hidden group"
                                            style={{
                                                borderColor: done
                                                    ? cat.color
                                                    : cat.color + "30",
                                                backgroundColor: done
                                                    ? cat.bg
                                                    : "#FAFAFA",
                                            }}
                                        >
                                            <div className="px-5 pt-5 pb-5 flex items-start gap-3">
                                                <button
                                                    onClick={() => markDone(i)}
                                                    disabled={done}
                                                    className="shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-default relative group/btn"
                                                    title={
                                                        done
                                                            ? "Completed"
                                                            : "Mark as done"
                                                    }
                                                    style={{
                                                        borderColor: done
                                                            ? cat.color
                                                            : "#CBCBD4",
                                                        backgroundColor: done
                                                            ? cat.color
                                                            : "white",
                                                    }}
                                                >
                                                    {done && (
                                                        <svg
                                                            width="10"
                                                            height="10"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="white"
                                                            strokeWidth="3.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    {!done && (
                                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[0.65rem] text-[#CBCBD4] font-medium opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                            tap to mark done
                                                        </span>
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
                                                            style={{
                                                                backgroundColor:
                                                                    cat.bg,
                                                                color: cat.color,
                                                                border: `1px solid ${cat.color}30`,
                                                            }}
                                                        >
                                                            {cat.label}
                                                        </span>
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
                                                            style={{
                                                                backgroundColor:
                                                                    done
                                                                        ? cat.color +
                                                                          "20"
                                                                        : "#F5F4FF",
                                                                color: done
                                                                    ? cat.color
                                                                    : "#5C58F6",
                                                            }}
                                                        >
                                                            +{obj.xp ?? 100} XP
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`font-semibold text-[0.925rem] leading-snug mb-1.5 ${done ? "line-through opacity-60" : "text-[#111117]"}`}
                                                    >
                                                        {obj.title}
                                                    </p>
                                                    <p
                                                        className={`text-[0.8rem] leading-relaxed ${done ? "opacity-50" : "text-[#8A8A95]"}`}
                                                    >
                                                        {obj.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <div className="rounded-xl bg-[#FAFAFA] border border-[#EBEBEF] px-4 py-3 flex items-start gap-2.5">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#CBCBD4"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 mt-0.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <p className="text-[0.75rem] text-[#B0B0BB] leading-relaxed">
                            Generated by Mo, vetted by the Alan medical team.
                            Does not replace professional medical advice.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem("mo-result");
                            router.push("/");
                        }}
                        className="w-full py-3.5 rounded-xl border-2 border-[#EBEBEF] bg-white hover:border-[#5C58F6] hover:text-[#5C58F6] hover:bg-[#F5F4FF] text-[0.875rem] font-semibold text-[#8A8A95] transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>←</span>
                        Create new content
                    </button>
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block w-[260px] shrink-0 sticky top-10 space-y-4">
                    <div className="rounded-2xl border border-[#EBEBEF] bg-white p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#C0C0C8] mb-0.5">
                                    Your level
                                </p>
                                <p className="text-[1.4rem] font-extrabold text-[#111117] leading-none">
                                    Lv.{level}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#F5F4FF] flex items-center justify-center">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#5C58F6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="h-2 rounded-full bg-[#EBEBEF] overflow-hidden mb-2">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${xpProgress}%`,
                                    backgroundColor: "#5C58F6",
                                }}
                            />
                        </div>
                        <p className="text-[0.7rem] text-[#8A8A95]">
                            {xpInLevel} / {XP_PER_LEVEL} XP ·{" "}
                            {XP_PER_LEVEL - xpInLevel} XP to next level
                        </p>
                        {earnedXp > 0 && (
                            <p className="text-[0.7rem] font-bold text-[#5C58F6] mt-1">
                                +{earnedXp} XP earned this session
                            </p>
                        )}
                    </div>

                    {objectives.length > 0 && (
                        <div className="rounded-2xl border border-[#EBEBEF] bg-white p-5">
                            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#C0C0C8] mb-3">
                                Objectives ({completed.size}/{objectives.length}
                                )
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
                                                    borderColor: done
                                                        ? cat.color
                                                        : "#CBCBD4",
                                                    backgroundColor: done
                                                        ? cat.color
                                                        : "transparent",
                                                }}
                                            >
                                                {done && (
                                                    <svg
                                                        width="8"
                                                        height="8"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="white"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-[0.78rem] leading-snug font-medium ${done ? "line-through opacity-50 text-[#8A8A95]" : "text-[#111117] group-hover:text-[#5C58F6]"} transition-colors`}
                                                >
                                                    {obj.title}
                                                </p>
                                                <p
                                                    className="text-[0.68rem] font-bold mt-0.5"
                                                    style={{ color: cat.color }}
                                                >
                                                    +{obj.xp ?? 100} XP
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {completed.size === objectives.length &&
                                objectives.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-[#EBEBEF] text-center">
                                        <p className="text-[0.8rem] font-bold text-[#5C58F6]">
                                            All objectives done!
                                        </p>
                                        <p className="text-[0.7rem] text-[#8A8A95] mt-0.5">
                                            +{earnedXp} XP total
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
