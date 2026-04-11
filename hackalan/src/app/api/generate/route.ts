import { Mistral } from "@mistralai/mistralai";
import { NextRequest, NextResponse } from "next/server";

type Format = "article" | "meditation" | "video_script";

interface UserProfile {
  name?: string;
  age?: number;
  level?: "beginner" | "intermediate" | "advanced";
  activeChallenge?: string;
  streakDays?: number;
  healthFocus?: string;
}

interface GenerateRequest {
  topic: string;
  format: Format;
  userProfile?: UserProfile;
}

const FORMAT_INSTRUCTIONS: Record<Format, string> = {
  article:
    "Rédige un article santé structuré en français : une introduction accrocheuse, 3-4 sections avec sous-titres, et une conclusion avec un appel à l'action. Utilise un ton bienveillant et scientifiquement fondé.",
  meditation:
    "Écris un script de méditation guidée en français, à lire à voix haute. Inclus : une phase d'ancrage (respiration), une visualisation, et un retour en douceur. Ton calme, voix à la deuxième personne du singulier.",
  video_script:
    "Écris un scénario de vidéo courte (60-90 secondes) en français. Format : accroche percutante, 3 points clés, call-to-action final. Indique les coupures visuelles avec [COUPE]. Ton dynamique et accessible.",
};

function buildSystemPrompt(format: Format): string {
  return `Tu es un expert en contenu santé numérique pour l'application Mo Studios, une plateforme de bien-être personnalisée. ${FORMAT_INSTRUCTIONS[format]}`;
}

function buildUserPrompt(
  topic: string,
  format: Format,
  userProfile?: UserProfile
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
      profileParts.push(`Challenge en cours : "${userProfile.activeChallenge}"`);
    if (userProfile.streakDays !== undefined)
      profileParts.push(`Streak actuel : ${userProfile.streakDays} jours consécutifs`);
    if (userProfile.healthFocus)
      profileParts.push(`Focus santé : ${userProfile.healthFocus}`);

    if (profileParts.length > 0) {
      prompt += `\n\nProfil de l'utilisateur :\n${profileParts.join("\n")}\n\nPersonnalise le contenu en tenant compte de ce profil : adapte le vocabulaire au niveau, mentionne le challenge en cours si pertinent, et encourage la progression du streak.`;
    }
  }

  return prompt;
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export async function POST(req: NextRequest) {
  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic, format, userProfile } = body;

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: topic (string required)" },
      { status: 400 }
    );
  }

  const validFormats: Format[] = ["article", "meditation", "video_script"];
  if (!format || !validFormats.includes(format)) {
    return NextResponse.json(
      {
        error: `Missing or invalid field: format must be one of ${validFormats.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: buildSystemPrompt(format) },
        { role: "user", content: buildUserPrompt(topic, format, userProfile) },
      ],
    });

    const content = result.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      content,
      topic,
      format,
      model: "mistral-large-latest",
    });
  } catch (err) {
    console.error("[/api/generate] Mistral error:", err);
    return NextResponse.json(
      { error: "Failed to generate content", details: String(err) },
      { status: 500 }
    );
  }
}
