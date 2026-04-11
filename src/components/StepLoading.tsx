"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StepProps, AnalysisResult } from "../types";

const STAGES = [{ label: "Personalization" }, { label: "Coaching" }];

const MESSAGES = [
    "Reading your profile...",
    "Fetching health data...",
    "Checking medical guidelines...",
    "Analyzing patterns...",
    "Calibrating tone and style...",
    "Finalizing your content...",
];

export default function StepLoading({
    data,
    next,
    setResult,
}: Pick<StepProps, "data" | "next" | "setResult">) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);
    const [msgIdx, setMsgIdx] = useState(0);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const started = useRef(false);
    const progressRef = useRef(0);

    const updateProgress = (val: number) => {
        const r = Math.round(val);
        progressRef.current = r;
        setProgress(r);
    };

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const msgTimer = setInterval(
            () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
            1400,
        );

        const run = async () => {
            try {
                setStage(0);
                const analysisRes = await fetch(
                    `/api/analyse_data?userId=${data.profileId || "a463e0bf26d790d6afdfda0cfd161cf5"}`,
                    { method: "GET" },
                );
                const analysis = await analysisRes.json();
                setAnalysisData(analysis);
                updateProgress(53);
                setStage(1);

                const generateRes = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        topic: data.custom || "General wellness",
                        format:
                            data.format === "video"
                                ? "video_script"
                                : data.format || "article",
                        userProfile: {
                            name: "Alex",
                            healthFocus: "general wellness",
                            level: "intermediate",
                        },
                        analysis,
                    }),
                });

                if (!generateRes.ok) {
                    throw new Error(
                        `Generate API failed with status ${generateRes.status}`,
                    );
                }

                const generated = await generateRes.json();
                const category = generated.objectives?.[0]?.category;

                return {
                    explanation: generated.explanation || [],
                    objectives: generated.objectives || [],
                    voiceScript: generated.voiceScript,
                    category,
                    scores: {
                        medical: analysis.overallHealthScore?.totalScore || 92,
                        brand: 90,
                        personalization: 95,
                    },
                    xp: Math.floor(100 + Math.random() * 50),
                    analysisData: analysis,
                } satisfies AnalysisResult;
            } catch (error) {
                console.error("Pipeline failed:", error);
                return {
                    explanation: [
                        {
                            title: "Content Generation Failed",
                            paragraph:
                                "We encountered an issue generating your personalized content. Please try again later.",
                        },
                    ],
                    objectives: [],
                    voiceScript: undefined,
                    category: undefined,
                    scores: { medical: 0, brand: 0, personalization: 0 },
                    xp: 0,
                } satisfies AnalysisResult;
            }
        };

        const tick = setInterval(() => {
            const c = progressRef.current;
            const inc =
                c < 25
                    ? Math.random() * 2 + 1
                    : c < 70
                      ? Math.random() + 0.2
                      : Math.random() * 0.3 + 0.05;
            updateProgress(Math.min(c + inc, 98));
            setStage(
                progressRef.current < 34 ? 0 : progressRef.current < 68 ? 1 : 2,
            );
        }, 150);

        run().then((res) => {
            clearInterval(tick);
            clearInterval(msgTimer);
            updateProgress(100);
            setStage(2);
            localStorage.setItem("mo-result", JSON.stringify(res));
            setTimeout(() => router.push("/result"), 600);
        });
        return () => {
            clearInterval(tick);
            clearInterval(msgTimer);
        };
    }, [data, router]);

    const r = 48,
        circ = 2 * Math.PI * r;

    return (
        <div className="flex flex-col items-center text-center py-8">
            {/* Mbappe animated character */}
            <div className="mb-8 relative h-32 w-32">
                <img
                    src="/mbappe.jpeg"
                    alt="Mo Coach"
                    className="absolute inset-0 w-full h-full rounded-full object-cover animate-pulse"
                />
                <img
                    src="/mbappe+founders.png"
                    alt="Mo Coach Comic"
                    className="absolute inset-0 w-full h-full rounded-full object-cover"
                    style={{
                        animation: "bounce 2s infinite",
                    }}
                />
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.7; }
                    50% { transform: translateY(-10px); opacity: 1; }
                }
            `}</style>

            <h2 className="text-[1.6rem] font-bold tracking-tight text-[#111117] mb-1.5">
                Mo is on it...
            </h2>
            <p className="text-[0.9rem] text-[#8A8A95] mb-12">
                Every piece of content is medically vetted before delivery.
            </p>

            {/* Circle progress */}
            <div className="relative w-36 h-36 mb-12">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                    <circle
                        cx="56"
                        cy="56"
                        r={r}
                        fill="none"
                        stroke="#EBEBEF"
                        strokeWidth="6"
                    />
                    <circle
                        cx="56"
                        cy="56"
                        r={r}
                        fill="none"
                        stroke="#5C58F6"
                        strokeWidth="6"
                        strokeDasharray={circ}
                        strokeDashoffset={circ * (1 - progress / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.25s ease" }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#111117]">
                    {progress}%
                </span>
            </div>

            {/* Fun Analysis Preview */}
            {analysisData?.overallHealthScore && (
                <div className="w-full max-w-2xl mb-12">
                    {/* Main Score Card */}
                    <div className="p-6 rounded-2xl border border-[#EBEBEF] bg-gradient-to-br from-[#F5F4FF] to-white mb-4">
                        <p className="text-xs uppercase tracking-widest font-bold text-[#8A8A95] mb-3">
                            Early peek at your analysis
                        </p>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-extrabold text-[#5C58F6]">
                                        {analysisData.overallHealthScore.totalScore}
                                    </span>
                                    <span className="text-sm font-bold text-[#8A8A95]">
                                        / 100
                                    </span>
                                </div>
                                <p className="text-sm text-[#6E6E73] font-medium">
                                    {analysisData.overallHealthScore.category || "Analyzing your health..."}
                                </p>
                            </div>
                            {analysisData.dataPoints && (
                                <div className="text-right">
                                    <p className="text-xs text-[#8A8A95] font-bold uppercase tracking-wide">
                                        Data Points
                                    </p>
                                    <p className="text-2xl font-bold text-[#5C58F6]">
                                        {analysisData.dataPoints}
                                    </p>
                                </div>
                            )}
                        </div>

                        {analysisData.overallHealthScore.componentScores && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {Object.entries(
                                    analysisData.overallHealthScore.componentScores
                                ).map(([key, value]: [string, any]) => (
                                    <div
                                        key={key}
                                        className="p-2 rounded-lg bg-white border border-[#EBEBEF] text-center hover:border-[#5C58F6] hover:bg-[#F5F4FF] transition-all cursor-pointer"
                                    >
                                        <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className="text-lg font-bold text-[#111117]">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Sleep Metrics */}
                        {analysisData.sleepAnalysis?.duration && (
                            <div className="p-4 rounded-xl bg-white border border-[#EBEBEF] hover:border-[#5C58F6] transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">😴</span>
                                    <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide">
                                        Sleep
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-[#111117] mb-1">
                                    {analysisData.sleepAnalysis.duration.mean.toFixed(1)}h avg
                                </p>
                                <p className="text-xs text-[#8A8A95]">
                                    Range: {analysisData.sleepAnalysis.duration.min.toFixed(1)}h - {analysisData.sleepAnalysis.duration.max.toFixed(1)}h
                                </p>
                            </div>
                        )}

                        {/* Activity Metrics */}
                        {analysisData.activityAnalysis?.steps && (
                            <div className="p-4 rounded-xl bg-white border border-[#EBEBEF] hover:border-[#5C58F6] transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">👟</span>
                                    <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide">
                                        Steps
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-[#111117] mb-1">
                                    {Math.round(analysisData.activityAnalysis.steps.mean).toLocaleString()}
                                </p>
                                <p className="text-xs text-[#8A8A95]">
                                    Daily average
                                </p>
                            </div>
                        )}

                        {/* Heart Rate Metrics */}
                        {analysisData.cardiovascularAnalysis?.restingHR && (
                            <div className="p-4 rounded-xl bg-white border border-[#EBEBEF] hover:border-[#5C58F6] transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">❤️</span>
                                    <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide">
                                        Heart Rate
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-[#111117] mb-1">
                                    {Math.round(analysisData.cardiovascularAnalysis.restingHR.mean)} bpm
                                </p>
                                <p className="text-xs text-[#8A8A95]">
                                    Resting
                                </p>
                            </div>
                        )}

                        {/* Calories Metrics */}
                        {analysisData.activityAnalysis?.activeCalories && (
                            <div className="p-4 rounded-xl bg-white border border-[#EBEBEF] hover:border-[#5C58F6] transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🔥</span>
                                    <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide">
                                        Active Cal
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-[#111117] mb-1">
                                    {Math.round(analysisData.activityAnalysis.activeCalories.mean)}
                                </p>
                                <p className="text-xs text-[#8A8A95]">
                                    Per day
                                </p>
                            </div>
                        )}

                        {/* Analysis Period */}
                        {analysisData.period && (
                            <div className="p-4 rounded-xl bg-white border border-[#EBEBEF] hover:border-[#5C58F6] transition-colors col-span-2">
                                <p className="text-xs font-bold text-[#8A8A95] uppercase tracking-wide mb-2">
                                    Analysis Period
                                </p>
                                <p className="text-sm font-bold text-[#111117]">
                                    {analysisData.period}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stages */}
            <div className="w-full flex flex-col gap-2 mb-8">
                {STAGES.map((stage_item, i) => {
                    const done = i < stage;
                    const current = i === stage;
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors duration-200"
                            style={{
                                borderColor:
                                    done || current ? "#5C58F6" : "#EBEBEF",
                                backgroundColor:
                                    done || current ? "#F5F4FF" : "#FAFAFA",
                            }}
                        >
                            <div
                                className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: done
                                        ? "#5C58F6"
                                        : "transparent",
                                    border: done
                                        ? "none"
                                        : `2px solid ${current ? "#5C58F6" : "#CBCBD4"}`,
                                }}
                            >
                                {done && (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-[0.875rem] font-medium text-[#111117]">
                                {stage_item.label}
                            </span>
                            {current && (
                                <span className="ml-auto text-[0.7rem] font-bold uppercase tracking-wider text-[#5C58F6] animate-pulse">
                                    In progress
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-[0.8rem] text-[#B0B0BB] font-medium">
                {MESSAGES[msgIdx]}
            </p>
        </div>
    );
}
