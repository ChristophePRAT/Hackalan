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
    Rédige un article santé en français comme un coach santé bienveillant qui parle directement au membre.
Règles :
- Tutoie le membre, utilise son prénom naturellement (pas à chaque phrase)
- Commence par une accroche liée à son vécu (son challenge en cours, son streak, son objectif)
- 3-4 sections avec des conseils ultra concrets et actionnables (pas de généralités vagues)
- Intègre des données chiffrées issues d'études scientifiques pour crédibiliser
- Chaque section doit contenir au moins un "micro-défi" que le membre peut appliquer ce soir
- Termine par un plan d'action en 3 étapes simples pour les prochaines 24h
- Ton : comme un ami médecin qui t'explique les choses simplement, jamais condescendant
- Longueur : 800-1200 mots
`,

    meditation: `Écris un script de méditation guidée en français, prêt à être lu à voix haute par une voix IA.
Règles :
- Durée de lecture : 5-7 minutes
- Commence par un ancrage dans le moment présent lié au contexte du membre (sa journée, son challenge)
- Structure : accueil (30s) → respiration guidée avec comptage précis (1min) → body scan ciblé (1min30) → visualisation immersive liée au thème santé (2min) → intention positive personnalisée (30s) → retour doux (30s)
- Indique les pauses avec [PAUSE 3s], [PAUSE 5s], [PAUSE 10s]
- Utilise des métaphores sensorielles (lumière, chaleur, vagues, souffle)
- Ton : voix douce, phrases courtes, rythme lent
- Tutoie le membre, glisse son prénom 2-3 fois maximum
- Jamais d'impératif brutal, préfère "tu peux", "je t'invite à", "laisse"`,

    video_script: `Écris un scénario de vidéo courte santé en français (60-90 secondes).
Règles :
- Accroche dans les 3 premières secondes : une stat choc ou une question provocante liée au vécu du membre
- Structure : hook (5s) → problème que le membre vit concrètement (15s) → explication scientifique vulgarisée en 1 phrase (10s) → 3 actions concrètes à faire aujourd'hui (30s) → call-to-action motivant lié à son challenge (10s)
- Indique les changements visuels avec [VISUEL : description]
- Indique le ton avec [TON : énergique/posé/complice]
- Écris comme un créateur TikTok santé : direct, punchy, zéro jargon
- Chaque phrase = 1 idée max
- Termine sur une phrase mémorable que le membre a envie de partager`,
};

function buildSystemPrompt(format: Format): string {
    return `Tu es un expert en contenu santé numérique pour l'application Mo Studios, une plateforme de bien-être personnalisée. ${FORMAT_INSTRUCTIONS[format]}. Les catégories de santé à utiliser pour classer les objectifs sont : Mental well-being, Sleep, Sport & physical activity, Nutrition, Breathing & relaxation, Digital detox, Habits & addictions, Productivity & organization, Relationships & social life, Personal development. Ne génère que du contenu en français.`;
}

function buildUserPrompt(
    topic: string,
    format: Format,
    userProfile?: UserProfile,
    analysis?: HealthAnalysis,
): string {
    const formatLabel: Record<Format, string> = {
        article: "article",
        meditation: "méditation guidée",
        video_script: "script vidéo",
    };

    let prompt = `Génère un ${formatLabel[format]} sur le thème : "${topic}".`;

    if (userProfile) {
        const profileParts: string[] = [];
        if (userProfile.name) profileParts.push(`Prénom : ${userProfile.name}`);
        if (userProfile.age) profileParts.push(`Âge : ${userProfile.age} ans`);
        if (userProfile.level) {
            const levelLabel = {
                beginner: "débutant",
                intermediate: "intermédiaire",
                advanced: "avancé",
            }[userProfile.level];
            profileParts.push(`Niveau : ${levelLabel}`);
        }
        if (userProfile.activeChallenge)
            profileParts.push(
                `Challenge en cours : "${userProfile.activeChallenge}"`,
            );
        if (userProfile.streakDays !== undefined)
            profileParts.push(
                `Streak actuel : ${userProfile.streakDays} jours consécutifs`,
            );
        if (userProfile.healthFocus)
            profileParts.push(`Focus santé : ${userProfile.healthFocus}`);

        if (profileParts.length > 0) {
            prompt += `\n\nProfil de l'utilisateur :\n${profileParts.join("\n")}\n\nPersonnalise le contenu en tenant compte de ce profil : adapte le vocabulaire au niveau, mentionne le challenge en cours si pertinent, et encourage la progression du streak.`;
        }
    }

    if (analysis) {
        prompt += `\n\nDonnées de santé détaillées de l'utilisateur (JSON) :\n${JSON.stringify(analysis, null, 2)}\n\nGénère des objectifs qui s'appuient complètement sur ces données de santé spécifiques. Analyse chaque métrique en détail et crée des recommandations hautement personnalisées basées sur tous les paramètres fournis (sommmeil, activité, santé cardiovasculaire, scores, etc.).`;
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
