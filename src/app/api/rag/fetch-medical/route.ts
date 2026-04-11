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
          `[fetch-medical] chunk ${i + 1}/${chunks.length} of ${source} failed:`,
          error.message
        );
        continue;
      }

      ingested++;
    } catch (err) {
      console.error(
        `[fetch-medical] chunk ${i + 1}/${chunks.length} of ${source} error:`,
        err
      );
    }
  }

  return ingested;
}

export async function POST(req: NextRequest) {
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

  let body: { topic: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic } = body;

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: topic (string required)" },
      { status: 400 }
    );
  }

  let linkupData: LinkupResponse;
  try {
    const linkupResponse = await fetch(LINKUP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINKUP_API_KEY}`,
      },
      body: JSON.stringify({
        q: `medical guidelines ${topic} health recommendations evidence-based`,
        depth: "deep",
        outputType: "searchResults",
        includeDomains: MEDICAL_DOMAINS,
      }),
    });

    if (!linkupResponse.ok) {
      const errorText = await linkupResponse.text();
      console.error("[fetch-medical] Linkup API error:", linkupResponse.status, errorText);
      return NextResponse.json(
        {
          error: "Linkup API request failed",
          status: linkupResponse.status,
          details: errorText,
        },
        { status: 503 }
      );
    }

    linkupData = await linkupResponse.json();
  } catch (err) {
    console.error("[fetch-medical] Linkup fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach Linkup API", details: String(err) },
      { status: 503 }
    );
  }

  const results: LinkupResult[] = linkupData.results ?? linkupData.output ?? [];

  if (results.length === 0) {
    return NextResponse.json({
      topicSearched: topic,
      documentsIngested: 0,
      chunksTotal: 0,
      sources: [],
      message: "No results returned by Linkup for this topic.",
    });
  }

  const fetchedAt = new Date().toISOString();
  let documentsIngested = 0;
  let chunksTotal = 0;
  const sources: string[] = [];

  for (const result of results) {
    const content = result.content ?? result.snippet ?? "";

    if (!content.trim() || !result.url) {
      continue;
    }

    let domain = "";
    try {
      domain = new URL(result.url).hostname;
    } catch {
      domain = result.url;
    }

    console.log(`[fetch-medical] Ingesting: ${result.url} (${domain})`);

    const chunksIngested = await ingestDocument(content, result.url, {
      topic,
      domain,
      fetchedAt,
      title: result.title ?? "",
    });

    if (chunksIngested > 0) {
      documentsIngested++;
      chunksTotal += chunksIngested;
      sources.push(result.url);
    }
  }

  return NextResponse.json({
    topicSearched: topic,
    documentsIngested,
    chunksTotal,
    sources,
  });
}
