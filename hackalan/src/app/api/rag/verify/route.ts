import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { supabase } from "@/lib/supabase";
import { getEmbedding } from "@/lib/embeddings";

export const maxDuration = 120;

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
  timeoutMs: 120000,
});

interface ClaimVerification {
  claim: string;
  status: "verified" | "unverified" | "incorrect";
  confidence: number;
  explanation: string;
  source: string;
  suggestedCorrection?: string;
}

async function extractClaims(content: string): Promise<string[]> {
  const result = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content: `Tu es un analyste médical. Extrais toutes les affirmations factuelles liées à la santé du texte fourni.
Retourne UNIQUEMENT un JSON array de strings, chaque string étant une affirmation santé distincte.
Ignore les opinions, les conseils subjectifs et les formulations vagues.
Concentre-toi sur les faits vérifiables : statistiques, effets sur la santé, mécanismes biologiques, recommandations médicales.
Exemple de réponse : ["La lumière bleue perturbe la production de mélatonine", "30 minutes d'exercice par jour réduit le risque cardiovasculaire de 20%"]`,
      },
      {
        role: "user",
        content: `Extrais les claims santé factuels de ce contenu :\n\n${content}`,
      },
    ],
    maxTokens: 2000,
    responseFormat: { type: "json_object" },
  });

  const raw = result.choices?.[0]?.message?.content ?? "[]";
  const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);

  try {
    const parsed = JSON.parse(rawStr);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.claims && Array.isArray(parsed.claims)) return parsed.claims;
    const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
    return (firstArray as string[]) ?? [];
  } catch {
    return [];
  }
}

async function verifyClaim(
  claim: string,
  sources: { content: string; source: string }[]
): Promise<ClaimVerification> {
  if (sources.length === 0) {
    return {
      claim,
      status: "unverified",
      confidence: 0,
      explanation: "Aucune source pertinente trouvée dans la base documentaire.",
      source: "",
    };
  }

  const sourcesText = sources
    .map((s, i) => `[Source ${i + 1} - ${s.source}]:\n${s.content}`)
    .join("\n\n");

  const result = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content: `Tu es un vérificateur médical rigoureux. On te donne une affirmation santé et des sources médicales de référence.
Vérifie si l'affirmation est soutenue par les sources.

Réponds UNIQUEMENT avec un JSON :
{
  "status": "verified" | "unverified" | "incorrect",
  "confidence": <nombre entre 0 et 100>,
  "explanation": "<explication concise en français>",
  "source": "<nom de la source principale utilisée>",
  "suggestedCorrection": "<si status=incorrect : reformulation factuelle correcte basée sur les sources, sinon null>"
}

Règles :
- "verified" : l'affirmation est clairement soutenue par au moins une source
- "incorrect" : l'affirmation contredit les sources — dans ce cas, propose une correction factuelle précise dans "suggestedCorrection"
- "unverified" : les sources ne permettent ni de confirmer ni d'infirmer
- La confidence reflète à quel point les sources sont claires et directes
- "suggestedCorrection" doit être null si le status n'est pas "incorrect"`,
      },
      {
        role: "user",
        content: `Affirmation à vérifier : "${claim}"\n\nSources disponibles :\n${sourcesText}`,
      },
    ],
    maxTokens: 600,
    responseFormat: { type: "json_object" },
  });

  const raw = result.choices?.[0]?.message?.content ?? "{}";
  const rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);

  try {
    const parsed = JSON.parse(rawStr);
    const verification: ClaimVerification = {
      claim,
      status: parsed.status ?? "unverified",
      confidence: parsed.confidence ?? 0,
      explanation: parsed.explanation ?? "",
      source: parsed.source ?? "",
    };
    if (parsed.status === "incorrect" && parsed.suggestedCorrection) {
      verification.suggestedCorrection = parsed.suggestedCorrection;
    }
    return verification;
  } catch {
    return {
      claim,
      status: "unverified",
      confidence: 0,
      explanation: "Erreur lors de l'analyse de la vérification.",
      source: "",
    };
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: { generatedContent: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { generatedContent } = body;
  if (
    !generatedContent ||
    typeof generatedContent !== "string" ||
    generatedContent.trim() === ""
  ) {
    return NextResponse.json(
      { error: "Missing or invalid field: generatedContent (string required)" },
      { status: 400 }
    );
  }

  try {
    const claims = await extractClaims(generatedContent);

    if (claims.length === 0) {
      return NextResponse.json({
        score: 100,
        totalClaims: 0,
        verifiedClaims: 0,
        details: [],
        message: "Aucune affirmation santé factuelle détectée dans le contenu.",
      });
    }

    const details: ClaimVerification[] = [];

    for (const claim of claims) {
      const embedding = await getEmbedding(claim);

      const { data: matchedDocs, error } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 3,
        }
      );

      if (error) {
        console.error(`[verify] Supabase RPC error for claim "${claim}":`, error.message);
      }

      const sources = (matchedDocs ?? []).map(
        (doc: { content: string; source: string }) => ({
          content: doc.content,
          source: doc.source,
        })
      );

      const verification = await verifyClaim(claim, sources);
      details.push(verification);
    }

    const verifiedClaims = details.filter((d) => d.status === "verified").length;
    const score = Math.round((verifiedClaims / details.length) * 100);

    let disclaimer: string;
    if (score < 50) {
      disclaimer =
        "⚠️ ATTENTION : Ce contenu n'a pas pu être suffisamment vérifié par des sources médicales fiables. Il ne doit pas être publié en l'état. Une revue par un professionnel de santé est obligatoire.";
    } else if (score < 80) {
      disclaimer =
        "⚠️ Certaines affirmations de ce contenu n'ont pas pu être vérifiées. Une relecture médicale est recommandée avant publication.";
    } else {
      disclaimer =
        "✅ Ce contenu est largement soutenu par des sources médicales fiables. Une relecture finale reste recommandée.";
    }

    const incorrectClaims = details
      .filter((d) => d.status === "incorrect")
      .map((d) => ({
        claim: d.claim,
        suggestedCorrection: d.suggestedCorrection ?? null,
      }));

    return NextResponse.json({
      score,
      disclaimer,
      totalClaims: details.length,
      verifiedClaims,
      details,
      incorrectClaims,
    });
  } catch (err) {
    console.error("[/api/rag/verify] Error:", err);
    return NextResponse.json(
      { error: "Verification failed", details: String(err) },
      { status: 500 }
    );
  }
}
