export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (words.length <= chunkSize) {
    return [words.join(" ")];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));

    if (end >= words.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}
