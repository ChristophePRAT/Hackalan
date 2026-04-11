import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
  timeoutMs: 120000,
});

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });

  return result.data[0].embedding as number[];
}
