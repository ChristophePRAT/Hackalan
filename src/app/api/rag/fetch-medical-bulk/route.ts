import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getEmbedding } from "@/lib/embeddings";
import { chunkText } from "@/lib/chunker";

export const maxDuration = 120;

const LINKUP_API_URL = "https://api.linkup.so/v1/search";

const MEDICAL_DOMAINS = [
  "who.int",
  "has-sante.fr",
  "pubmed.ncbi.nlm.nih.gov",
  "cochrane.org",
  "nhs.uk",
  "inserm.fr",
  "ameli.fr",
];

const BULK_TOPICS = [
  "sleep hygiene recommendations evidence-based",
  "blue light melatonin screen exposure",
  "insomnia cognitive behavioral therapy",
  "digital detox mental health benefits",
  "smartphone addiction dopamine reward system",
  "screen time anxiety depression",
  "balanced diet guidelines WHO",
  "mediterranean diet health benefits",
  "sugar consumption health risks",
  "chronic stress cortisol health effects",
  "mindfulness meditation stress reduction",
  "breathing exercises anxiety management",
  "tobacco cessation nicotine replacement",
  "smoking health risks cardiovascular",
  "secondhand smoke exposure risks",
  "physical activity mental health benefits",
  "sedentary lifestyle health risks",
  "hydration health recommendations",
  "caffeine sleep quality impact",
  "alcohol consumption health guidelines",
];

interface LinkupResult {
  url: string;
  title?: string;
  content?: string;
  snippet?: string;
}

interface LinkupResponse {
  results?: LinkupResult[];
  output?: LinkupResult[];
}

async function isAlreadyIngested(url: string): Promise<boolean> {
  const { data } = await supabase
    .from("documents")
    .select("id")
    .eq("source", url)
    .limit(1);
  return (data ?? []).length > 0;
}

async function searchLinkup(query: string): Promise<LinkupResult[]> {
  const response = await fetch(LINKUP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINKUP_API_KEY}`,
    },
    body: JSON.stringify({
      q: query,
      depth: "deep",
      outputType: "searchResults",
      includeDomains: MEDICAL_DOMAINS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[fetch-medical-bulk] Linkup error for "${query}":`, response.status, errorText);
    return [];
  }

  const data: LinkupResponse = await response.json();
  return data.results ?? data.output ?? [];
}

async function ingestDocument(
  content: string,
  source: string,
  metadata: Record<string, unknown>
): Promise<number> {
  const chunks = chunkText(content);
  let ingested = 0;

  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await getEmbedding(chunks[i]);

      const { error } = await supabase.from("documents").insert({
        content: chunks[i],
        source,
        metadata: { ...metadata, chunkIndex: i, totalChunks: chunks.length },
        embedding,
      });

      if (error) {
        console.error(
          `[fetch-medical-bulk] chunk ${i + 1}/${chunks.length} of ${source} failed:`,
          error.message
        );
        continue;
      }

      ingested++;
    } catch (err) {
      console.error(
        `[fetch-medical-bulk] chunk ${i + 1}/${chunks.length} of ${source} error:`,
        err
      );
    }
  }

  return ingested;
}

export async function POST(_req: NextRequest) {
  if (!process.env.LINKUP_API_KEY) {
    return NextResponse.json(
      { error: "LINKUP_API_KEY is not configured" },
      { status: 500 }
    );
  }

  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const fetchedAt = new Date().toISOString();
  let totalDocumentsIngested = 0;
  let totalChunks = 0;
  let totalDeduplicated = 0;
  const topicResults: { topic: string; documentsIngested: number; skipped: number }[] = [];

  for (const topic of BULK_TOPICS) {
    console.log(`\n[fetch-medical-bulk] Searching topic: "${topic}"`);

    let results: LinkupResult[] = [];
    try {
      results = await searchLinkup(topic);
    } catch (err) {
      console.error(`[fetch-medical-bulk] Failed to fetch topic "${topic}":`, err);
      topicResults.push({ topic, documentsIngested: 0, skipped: 0 });
      continue;
    }

    let topicIngested = 0;
    let topicSkipped = 0;

    for (const result of results) {
      const content = result.content ?? result.snippet ?? "";

      if (!content.trim() || !result.url) continue;

      const alreadyExists = await isAlreadyIngested(result.url);
      if (alreadyExists) {
        console.log(`  [SKIP] Already ingested: ${result.url}`);
        topicSkipped++;
        totalDeduplicated++;
        continue;
      }

      let domain = "";
      try {
        domain = new URL(result.url).hostname;
      } catch {
        domain = result.url;
      }

      console.log(`  [INGEST] ${result.url}`);

      const chunksIngested = await ingestDocument(content, result.url, {
        topic,
        domain,
        fetchedAt,
        title: result.title ?? "",
      });

      if (chunksIngested > 0) {
        topicIngested++;
        totalDocumentsIngested++;
        totalChunks += chunksIngested;
      }
    }

    topicResults.push({ topic, documentsIngested: topicIngested, skipped: topicSkipped });
  }

  return NextResponse.json({
    totalTopics: BULK_TOPICS.length,
    totalDocumentsIngested,
    totalChunks,
    totalDeduplicated,
    topicResults,
  });
}
