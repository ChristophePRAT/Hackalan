"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "../../types";
import { CATEGORIES, XP_PER_LEVEL } from "../../constants";

const SCORE_META = {
    medical: { label: "Medical accuracy", color: "#10B981" },
    brand: { label: "Mo · Alan Voice", color: "#5C58F6" },
    personalization: { label: "Personalization", color: "#F59E0B" },
} as const;

function getCat(label?: string) {
    return (
        CATEGORIES.find((c) => c.label === label) ?? {
            label: label ?? "Health",
            color: "#5C58F6",
            bg: "#F5F4FF",
        }
    );
}

function renderBody(body: string, accent: string) {
    return body.split("\n").map((line, i) => {
        if (line.startsWith("# "))
            return (
                <h1
                    key={i}
                    className="text-xl font-bold mt-6 mb-3 first:mt-0 text-[#111117]"
                >
                    {line.slice(2)}
                </h1>
            );
        if (line.startsWith("## "))
            return (
                <h2
                    key={i}
                    className="text-lg font-bold mt-5 mb-2 first:mt-0 text-[#111117]"
                >
                    {line.slice(3)}
                </h2>
            );
        if (line.startsWith("### "))
            return (
                <h3
                    key={i}
                    className="text-base font-bold mt-4 mb-2 first:mt-0 text-[#111117]"
                >
                    {line.slice(4)}
                </h3>
            );
        if (line.trim().match(/^[-*] /)) {
            const parts = line
                .trim()
                .slice(2)
                .split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="flex gap-2.5 mb-2 ml-1">
                    <span
                        className="shrink-0 mt-[0.45rem] w-1 h-1 rounded-full"
                        style={{ backgroundColor: accent }}
                    />
                    <p className="text-[0.875rem] leading-relaxed text-[#374151]">
                        {parts.map((p, j) =>
                            p.startsWith("**") && p.endsWith("**") ? (
                                <strong
                                    key={j}
                                    className="font-semibold text-[#111117]"
                                >
                                    {p.slice(2, -2)}
                                </strong>
                            ) : (
                                p
                            ),
                        )}
                    </p>
                </div>
            );
        }
        const num = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (num) {
            const parts = num[2].split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="flex gap-2.5 mb-2 ml-1">
                    <span
                        className="shrink-0 text-[0.8rem] font-bold mt-0.5"
                        style={{ color: accent }}
                    >
                        {num[1]}.
                    </span>
                    <p className="text-[0.875rem] leading-relaxed text-[#374151]">
                        {parts.map((p, j) =>
                            p.startsWith("**") && p.endsWith("**") ? (
                                <strong
                                    key={j}
                                    className="font-semibold text-[#111117]"
                                >
                                    {p.slice(2, -2)}
                                </strong>
                            ) : (
                                p
                            ),
                        )}
                    </p>
                </div>
            );
        }
        if (line.trim() === "") return <div key={i} className="h-3" />;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p
                key={i}
                className="mb-3 last:mb-0 text-[0.875rem] leading-relaxed text-[#374151]"
            >
                {parts.map((p, j) =>
                    p.startsWith("**") && p.endsWith("**") ? (
                        <strong
                            key={j}
                            className="font-semibold text-[#111117]"
                        >
                            {p.slice(2, -2)}
                        </strong>
                    ) : (
                        p
                    ),
                )}
            </p>
        );
    });
}

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [copied, setCopied] = useState(false);
    const [validated, setValidated] = useState(false);
    const [totalXp, setTotalXp] = useState(0);
    const [levelUp, setLevelUp] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("mo-result");
        if (saved) setResult(JSON.parse(saved));
        else router.push("/");
        setTotalXp(parseInt(localStorage.getItem("mo-total-xp") ?? "0", 10));
    }, [router]);

    const copy = () => {
        if (result?.body) {
            navigator.clipboard.writeText(result.body);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    const validate = () => {
        if (validated) return;
        const earned = result?.xp ?? 100;
        const next = totalXp + earned;
        if (
            Math.floor(next / XP_PER_LEVEL) > Math.floor(totalXp / XP_PER_LEVEL)
        )
            setLevelUp(true);
        localStorage.setItem("mo-total-xp", String(next));
        setTotalXp(next);
        setValidated(true);
    };

    if (!result)
        return (
            <div className="min-h-screen flex items-center justify-center text-[#8A8A95] text-sm">
                Loading...
            </div>
        );

    const cat = getCat(result.category);
    const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const xpInLevel = totalXp % XP_PER_LEVEL;
    const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

    return (
        <div className="min-h-screen bg-white px-6 py-16 flex flex-col items-center">
            <div className="w-full max-w-[600px] mx-auto">
                {/* Brand */}
                <header className="text-center mb-10 fade-up">
                    <div className="inline-flex items-center gap-3">
                        <img
                            src="/alan-logo.png"
                            alt="Alan"
                            className="h-10 w-auto"
                        />
                        <span className="font-extrabold text-[1.4rem] tracking-tight text-[#111117]">
                            Mo Studios
                        </span>
                    </div>
                </header>

                <div className="fade-up space-y-4">
                    {/* Category + title */}
                    <div>
                        <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-wide mb-3"
                            style={{
                                backgroundColor: cat.bg,
                                color: cat.color,
                            }}
                        >
                            {cat.label}
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-[#111117] leading-snug">
                            {result.title}
                        </h1>
                    </div>

                    {/* Content card */}
                    <div
                        className="rounded-[20px] border-2 overflow-hidden mb-8"
                        style={{
                            borderColor: cat.color + "40",
                            backgroundColor: "#FAFAFA",
                        }}
                    >
                        {result.explanation &&
                            result.explanation.length > 0 && (
                                <>
                                    {result.explanation.map((exp, expIdx) => (
                                        <div key={expIdx}>
                                            <div
                                                className="px-8 pt-8 pb-6"
                                                style={{
                                                    borderBottom:
                                                        "1px solid var(--color-alan-border)",
                                                    backgroundColor:
                                                        expIdx === 0
                                                            ? cat.bg + "CC"
                                                            : "#FAFAFA",
                                                }}
                                            >
                                                <h2
                                                    className="font-bold leading-snug text-[1.5rem]"
                                                    style={{
                                                        color: "var(--color-alan-text)",
                                                    }}
                                                >
                                                    {exp.title}
                                                </h2>
                                            </div>
                                            <div
                                                className="px-8 py-8 text-[1rem] leading-relaxed"
                                                style={{
                                                    color: "var(--color-alan-text)",
                                                }}
                                            >
                                                <p className="mb-0">
                                                    {exp.paragraph}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        {result.objectives && result.objectives.length > 0 && (
                            <div
                                className="px-8 py-8 text-[1rem] leading-relaxed"
                                style={{ color: "var(--color-alan-text)" }}
                            >
                                <h3
                                    className="font-bold text-lg mb-6"
                                    style={{ color: "var(--color-alan-text)" }}
                                >
                                    Objectives
                                </h3>
                                <div className="space-y-4">
                                    {result.objectives.map((obj, oIdx) => (
                                        <div key={oIdx} className="flex gap-3">
                                            <span
                                                className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                                                style={{
                                                    backgroundColor: cat.color,
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold mb-1">
                                                    {obj.title}
                                                </p>
                                                <p className="text-sm">
                                                    {obj.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="px-8 pb-8">
                            <button
                                onClick={copy}
                                className="w-full py-4 rounded-2xl border-2 font-semibold text-base transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                                style={{
                                    borderColor: copied
                                        ? "#10B981"
                                        : "var(--color-alan-border)",
                                    color: copied
                                        ? "#10B981"
                                        : "var(--color-alan-text)",
                                    backgroundColor: copied
                                        ? "#ECFDF5"
                                        : "#FFFFFF",
                                }}
                            >
                                {copied ? (
                                    <>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                            />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy content
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Copy */}
                    <button
                        onClick={copy}
                        className="w-full py-3 rounded-xl border text-[0.875rem] font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                        style={{
                            borderColor: copied ? "#10B981" : "#EBEBEF",
                            backgroundColor: copied ? "#ECFDF5" : "#FAFAFA",
                            color: copied ? "#10B981" : "#8A8A95",
                        }}
                    >
                        {copied ? (
                            <>
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Copied
                            </>
                        ) : (
                            <>
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="9"
                                        y="9"
                                        width="13"
                                        height="13"
                                        rx="2"
                                    />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy content
                            </>
                        )}
                    </button>

                    {/* Validate / XP */}
                    <div
                        className="rounded-xl border p-5 transition-all duration-300"
                        style={{
                            borderColor: validated
                                ? cat.color + "50"
                                : "#EBEBEF",
                            backgroundColor: validated ? cat.bg : "#FAFAFA",
                        }}
                    >
                        {!validated ? (
                            <>
                                <p className="font-semibold text-[0.925rem] text-[#111117] mb-1">
                                    Complete to earn{" "}
                                    <span style={{ color: cat.color }}>
                                        +{result.xp ?? 100} XP
                                    </span>
                                </p>
                                <p className="text-[0.8rem] text-[#8A8A95] mb-4">
                                    Validate once you've read or listened to the
                                    content.
                                </p>
                                <button
                                    onClick={validate}
                                    className="w-full py-3.5 rounded-xl font-semibold text-[0.875rem] text-white transition-all duration-150 cursor-pointer"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    ✓ Mark as done — +{result.xp ?? 100} XP
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p
                                            className="font-semibold text-[0.925rem] mb-0.5"
                                            style={{ color: cat.color }}
                                        >
                                            {levelUp
                                                ? `Level up! Now Level ${level} 🎉`
                                                : `+${result.xp ?? 100} XP earned`}
                                        </p>
                                        <p className="text-[0.75rem] text-[#8A8A95]">
                                            Level {level} · {xpInLevel} /{" "}
                                            {XP_PER_LEVEL} XP
                                        </p>
                                    </div>
                                    <span
                                        className="font-bold text-xl"
                                        style={{ color: cat.color }}
                                    >
                                        Lv.{level}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#EBEBEF] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${xpProgress}%`,
                                            backgroundColor: cat.color,
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Scores */}
                    <div className="rounded-xl border border-[#EBEBEF] bg-[#FAFAFA] px-5 py-5">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#C0C0C8] mb-5">
                            Quality
                        </p>
                        <div className="flex flex-col gap-4">
                            {Object.entries(SCORE_META).map(([key, m]) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[0.8rem] font-medium text-[#374151]">
                                            {m.label}
                                        </span>
                                        <span
                                            className="text-[0.8rem] font-bold"
                                            style={{ color: m.color }}
                                        >
                                            {result.scores?.[
                                                key as keyof typeof result.scores
                                            ] ?? 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="h-1 rounded-full bg-[#EBEBEF] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: `${result.scores?.[key as keyof typeof result.scores] ?? 0}%`,
                                                backgroundColor: m.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[0.75rem] text-[#B0B0BB] leading-relaxed text-center px-2">
                        Generated by Mo, vetted by the Alan medical team. Does
                        not replace professional medical advice.
                    </p>

                    {/* Restart */}
                    <button
                        onClick={() => {
                            localStorage.removeItem("mo-result");
                            router.push("/");
                        }}
                        className="w-full py-3.5 rounded-xl border border-[#EBEBEF] bg-white hover:bg-[#F5F4FF] hover:border-[#5C58F6] hover:text-[#5C58F6] text-[0.875rem] font-semibold text-[#8A8A95] transition-all duration-150 cursor-pointer"
                    >
                        Create new content
                    </button>
                </div>
            </div>
        </div>
    );
}
