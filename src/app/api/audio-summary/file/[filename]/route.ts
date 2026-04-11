import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (
    !filename.endsWith(".mp3") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return NextResponse.json(
      { error: "Invalid filename" },
      { status: 400 }
    );
  }

  const filepath = join(tmpdir(), filename);

  if (!existsSync(filepath)) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }

  const buffer = readFileSync(filepath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
