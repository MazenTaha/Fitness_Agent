const DEFAULT_MAX_CHUNK_SIZE = 3500;

function splitLargeBlock(text: string, maxChunkSize: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= maxChunkSize) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (word.length <= maxChunkSize) {
      currentChunk = word;
      continue;
    }

    for (let index = 0; index < word.length; index += maxChunkSize) {
      chunks.push(word.slice(index, index + maxChunkSize));
    }

    currentChunk = "";
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function splitWhatsAppMessage(
  text: string,
  maxChunkSize = DEFAULT_MAX_CHUNK_SIZE
): string[] {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  if (normalizedText.length <= maxChunkSize) {
    return [normalizedText];
  }

  const blocks = normalizedText.split(/\n{2,}/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of blocks) {
    const normalizedBlock = block.trim();

    if (!normalizedBlock) {
      continue;
    }

    const candidate = currentChunk
      ? `${currentChunk}\n\n${normalizedBlock}`
      : normalizedBlock;

    if (candidate.length <= maxChunkSize) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    if (normalizedBlock.length <= maxChunkSize) {
      currentChunk = normalizedBlock;
      continue;
    }

    chunks.push(...splitLargeBlock(normalizedBlock, maxChunkSize));
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
