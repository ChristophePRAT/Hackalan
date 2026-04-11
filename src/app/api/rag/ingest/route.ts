import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getEmbedding } from "@/lib/embeddings";
import { chunkText } from "@/lib/chunker";

export const maxDuration = 120;

interface IngestRequest {
  content: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: IngestRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, source, metadata } = body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: content (string required)" },
      { status: 400 }
    );
  }

  if (!source || typeof source !== "string" || source.trim() === "") {
    return NextResponse.json(
      { error: "Missing or invalid field: source (string required)" },
      { status: 400 }
    );
  }

  try {
    const chunks = chunkText(content);
    let ingested = 0;

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);

      const { error } = await supabase.from("documents").insert({
        content: chunks[i],
        source,
        metadata: { ...metadata, chunkIndex: i, totalChunks: chunks.length },
        embedding,
      });

      if (error) {
        console.error(`[ingest] chunk ${i + 1}/${chunks.length} failed:`, error.message);
        continue;
      }

      ingested++;
    }

    return NextResponse.json({
      chunksIngested: ingested,
      totalChunks: chunks.length,
      source,
    });
  } catch (err) {
    console.error("[/api/rag/ingest] Error:", err);
    return NextResponse.json(
      { error: "Ingestion failed", details: String(err) },
      { status: 500 }
    );
  }
}
