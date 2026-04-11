import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

type Format = "article" | "meditation" | "video_script";

interface UserProfile {
    name?: string;
    age?: number;
    level?: "beginner" | "intermediate" | "advanced";
    activeChallenge?: string;
    streakDays?: number;
    healthFocus?: string;
}

interface HealthAnalysis {
    overallHealthScore?: {
        totalScore: number;
        category: string;
        componentScores?: {
            sleep: number;
            activity: number;
            cardiovascular: number;
        };
        summary?: {
            status: string;
            primaryInsight: string;
            volatilityIndex: number;
            consistencyIndex: number;
        };
    };
    sleepAnalysis?: {
        averages: {
            totalSleepMinutes: number;
            efficiencyPercentage: number;
            remPercentage?: number;
            deepPercentage?: number;
        };
        qualityScore?: number;
        consistencyScore?: number;
    };
    activityAnalysis?: {
        steps?: { mean: number };
        calories?: { mean: number };
        activeMinutes?: { mean: number };
        activityScore?: number;
        intensityScore?: number;
    };
    cardiovascularAnalysis?: {
        restingHR?: { mean: number };
        hrVariability?: { mean: number };
        cardiovascularScore?: number;
    };
}

interface GenerateRequest {
    topic: string;
    format: Format;
    userProfile?: UserProfile;
    analysis?: HealthAnalysis;
}

const categories = z.literal([
    "Mental well-being",
    "Sleep",
    "Sport & physical activity",
    "Nutrition",
    "Breathing & relaxation",
    "Digital detox",
    "Habits & addictions",
    "Productivity & organization",
    "Relationships & social life",
    "Personal development",
]);

const ObjectivesResponse = z.object({
    explanation: z.array(
        z.object({
            title: z.string(),
            paragraph: z.string(),
        }),
    ),
    objectives: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            category: z.string(),
        }),
    ),
});

const FORMAT_INSTRUCTIONS: Record<Format, string> = {
    article: `
Write a health article in English as a caring health coach speaking directly to the user.
Rules:
- Address the user informally, use their name naturally (not every sentence)
- Start with a hook related to their personal situation (current challenge, streak, goals)
- 3-4 sections with ultra concrete, actionable advice (no vague generalities)
- Include scientific data from research studies to build credibility
- Each section must contain at least one "micro-challenge" the user can apply tonight
- End with a simple 3-step action plan for the next 24 hours
- Tone: like a friend and doctor explaining things simply, never condescending
- Length: 800-1200 words
`,

    meditation: `Write a guided meditation script in English, ready to be read aloud by an AI voice.
Rules:
- Reading time: 5-7 minutes
- Start with grounding in the present moment linked to the user's context (their day, challenge)
- Structure: welcome (30s) → guided breathing with precise counting (1min) → targeted body scan (1min30) → immersive health-related visualization (2min) → personalized positive intention (30s) → gentle return (30s)
- Mark pauses with [PAUSE 3s], [PAUSE 5s], [PAUSE 10s]
- Use sensory metaphors (light, warmth, waves, breath)
- Tone: soft voice, short sentences, slow rhythm
- Address the user informally, mention their name 2-3 times maximum
- Never use harsh imperatives, prefer "you can", "I invite you to", "let"`,

    video_script: `Write a short health video script in English (60-90 seconds).
Rules:
- Hook in the first 3 seconds: a shocking stat or provocative question related to the user's experience
- Structure: hook (5s) → problem the user faces concretely (15s) → simplified scientific explanation in 1 sentence (10s) → 3 concrete actions to do today (30s) → motivating call-to-action linked to their challenge (10s)
- Mark visual changes with [VISUAL: description]
- Indicate tone with [TONE: energetic/calm/complicit]
- Write like a health TikTok creator: direct, punchy, zero jargon
- Each sentence = 1 idea max
- End with a memorable sentence the user wants to share`,
};

function buildSystemPrompt(format: Format): string {
    return `You are an expert in digital health content for Mo Studios, a personalized wellness platform. ${FORMAT_INSTRUCTIONS[format]}. The health categories to use for classifying objectives are: Mental well-being, Sleep, Sport & physical activity, Nutrition, Breathing & relaxation, Digital detox, Habits & addictions, Productivity & organization, Relationships & social life, Personal development. Generate content in English.`;
}

function buildUserPrompt(
    topic: string,
    format: Format,
    userProfile?: UserProfile,
    analysis?: HealthAnalysis,
): string {
    const formatLabel: Record<Format, string> = {
        article: "article",
        meditation: "guided meditation",
        video_script: "video script",
    };

    let prompt = `Generate a ${formatLabel[format]} on the topic: "${topic}".`;

    if (userProfile) {
        const profileParts: string[] = [];
        if (userProfile.name) profileParts.push(`Name: ${userProfile.name}`);
        if (userProfile.age) profileParts.push(`Age: ${userProfile.age} years old`);
        if (userProfile.level) {
            const levelLabel = {
                beginner: "beginner",
                intermediate: "intermediate",
                advanced: "advanced",
            }[userProfile.level];
            profileParts.push(`Level: ${levelLabel}`);
        }
        if (userProfile.activeChallenge)
            profileParts.push(
                `Current challenge: "${userProfile.activeChallenge}"`,
            );
        if (userProfile.streakDays !== undefined)
            profileParts.push(
                `Current streak: ${userProfile.streakDays} consecutive days`,
            );
        if (userProfile.healthFocus)
            profileParts.push(`Health focus: ${userProfile.healthFocus}`);

        if (profileParts.length > 0) {
            prompt += `\n\nUser Profile:\n${profileParts.join("\n")}\n\nPersonalize the content based on this profile: adapt vocabulary to their level, mention their current challenge if relevant, and encourage streak progression.`;
        }
    }

    if (analysis) {
        prompt += `\n\nDetailed User Health Data (JSON):\n${JSON.stringify(analysis, null, 2)}\n\nGenerate objectives that are completely grounded in this specific health data. Analyze each metric in detail and create highly personalized recommendations based on all provided parameters (sleep, activity, cardiovascular health, scores, etc.).`;
    }

    return prompt;
}

const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY!,
    timeoutMs: 120000,
});

export async function POST(req: NextRequest) {
    if (!process.env.MISTRAL_API_KEY) {
        return NextResponse.json(
            { error: "MISTRAL_API_KEY is not configured" },
            { status: 500 },
        );
    }

    let body: GenerateRequest;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const { topic, format, userProfile, analysis } = body;

    if (!topic || typeof topic !== "string" || topic.trim() === "") {
        return NextResponse.json(
            { error: "Missing or invalid field: topic (string required)" },
            { status: 400 },
        );
    }

    const validFormats: Format[] = ["article", "meditation", "video_script"];
    if (!format || !validFormats.includes(format)) {
        return NextResponse.json(
            {
                error: `Missing or invalid field: format must be one of ${validFormats.join(", ")}`,
            },
            { status: 400 },
        );
    }

    try {
        const result = await mistral.chat.parse({
            model: "mistral-large-latest",
            messages: [
                { role: "system", content: buildSystemPrompt(format) },
                {
                    role: "user",
                    content: buildUserPrompt(
                        topic,
                        format,
                        userProfile,
                        analysis,
                    ),
                },
            ],
            // maxTokens: 2000,
            responseFormat: ObjectivesResponse,
        });

        const messageContent = result.choices[0].message?.content;

        // If content is a string, parse it as JSON
        let parsedContent = messageContent;
        if (typeof messageContent === 'string') {
            try {
                parsedContent = JSON.parse(messageContent);
            } catch {
                parsedContent = messageContent;
            }
        }

        console.log("[/api/generate] Parsed content:", parsedContent);
        return NextResponse.json(parsedContent);
    } catch (err) {
        console.error("[/api/generate] Mistral error:", err);
        console.error("Request body was:", body);
        return NextResponse.json(
            { error: "Failed to generate content", details: String(err) },
            { status: 500 },
        );
    }
}
