import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export const maxDuration = 120;

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
  timeoutMs: 120000,
});

async function resolveVoiceId(): Promise<string | null> {
  if (process.env.VOXTRAL_VOICE_ID) {
    return process.env.VOXTRAL_VOICE_ID;
  }

  try {
    const result = await mistral.audio.voices.list({ limit: 50, offset: 0 });
    const voices = result.items ?? [];

    const frenchVoice = voices.find((v) =>
      v.languages?.includes("fr")
    );
    if (frenchVoice) return frenchVoice.id;

    if (voices.length > 0) return voices[0].id;
  } catch (err) {
    console.error("[audio-summary] Failed to list voices:", err);
  }

  return null;
}

async function generateCoachScript(content: string): Promise<string> {
  const result = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "system",
        content:
          "You are a warm health coach. Extract the 3-4 micro-challenges or concrete actions from this article. Rewrite them as a short audio script (30-45 seconds) as if you're speaking directly to the member. Warm, encouraging, direct tone. Start with 'Here are your challenges for today' and end with a motivating sentence. No markdown, no formatting, just natural spoken text.",
      },
      {
        role: "user",
        content,
      },
    ],
    maxTokens: 500,
  });

  const raw = result.choices?.[0]?.message?.content ?? "";
  return typeof raw === "string" ? raw : JSON.stringify(raw);
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

  let script: string;
  try {
    script = await generateCoachScript(generatedContent);
  } catch (err) {
    console.error("[audio-summary] Script generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate coach script", details: String(err) },
      { status: 500 }
    );
  }

  if (!script.trim()) {
    return NextResponse.json(
      { error: "Generated script was empty" },
      { status: 500 }
    );
  }

  const voiceId = await resolveVoiceId();

  if (!voiceId) {
    return NextResponse.json({
      script,
      audioUrl: null,
      duration: "~30-45s",
      ttsError: "No voice available. Set VOXTRAL_VOICE_ID in .env.local or create a voice in Mistral Studio.",
    });
  }

  try {
    const ttsResponse = await mistral.audio.speech.complete({
      model: "voxtral-mini-tts-2603",
      input: script,
      voiceId,
      responseFormat: "mp3",
    });

    const audioBuffer = Buffer.from(ttsResponse.audioData, "base64");
    const filename = `audio-summary-${Date.now()}.mp3`;
    const filepath = join(tmpdir(), filename);

    writeFileSync(filepath, audioBuffer);

    return NextResponse.json({
      script,
      audioUrl: `/api/audio-summary/file/${filename}`,
      duration: "~30-45s",
    });
  } catch (err) {
    console.error("[audio-summary] TTS failed:", err);
    return NextResponse.json({
      script,
      audioUrl: null,
      duration: "~30-45s",
      ttsError: `TTS generation failed: ${String(err)}`,
    });
  }
}
