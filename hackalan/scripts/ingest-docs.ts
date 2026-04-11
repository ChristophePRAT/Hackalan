import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Mistral } from "@mistralai/mistralai";
import { chunkText } from "../src/lib/chunker";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !MISTRAL_API_KEY) {
  console.error(
    "Missing env vars. Set SUPABASE_URL, SUPABASE_ANON_KEY, and MISTRAL_API_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const mistral = new Mistral({ apiKey: MISTRAL_API_KEY, timeoutMs: 120000 });

async function getEmbedding(text: string): Promise<number[]> {
  const result = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });
  return result.data[0].embedding;
}

async function main() {
  const docsDir = path.join(__dirname, "..", "data", "medical-docs");

  if (!fs.existsSync(docsDir)) {
    console.error(`Directory not found: ${docsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".txt") || f.endsWith(".md"));

  if (files.length === 0) {
    console.log("No .txt or .md files found in data/medical-docs/");
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s) to ingest.\n`);

  let totalChunks = 0;

  for (const filename of files) {
    const filepath = path.join(docsDir, filename);
    const text = fs.readFileSync(filepath, "utf-8");
    const chunks = chunkText(text);

    console.log(`[${filename}] ${chunks.length} chunk(s) to process`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await getEmbedding(chunks[i]);

        const { error } = await supabase.from("documents").insert({
          content: chunks[i],
          source: filename,
          metadata: { filename, chunkIndex: i },
          embedding,
        });

        if (error) {
          console.error(`  [${filename}] chunk ${i + 1}/${chunks.length} FAILED:`, error.message);
          continue;
        }

        totalChunks++;
        console.log(`  [${filename}] chunk ${i + 1}/${chunks.length} ingested`);
      } catch (err) {
        console.error(`  [${filename}] chunk ${i + 1}/${chunks.length} ERROR:`, err);
      }
    }
  }

  console.log(`\nDone. ${totalChunks} chunk(s) ingested total.`);
}

main();
