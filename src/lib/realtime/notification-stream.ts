import { env } from "@/lib/env";
import type { RealtimeStreamPayload } from "@/lib/realtime/bus";

function parseSseDataLine(data: string): RealtimeStreamPayload | null {
  try {
    let parsed: unknown = JSON.parse(data);
    // Tolerate legacy double-encoded payloads from older API builds.
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const payload = parsed as RealtimeStreamPayload;
    if ("kind" in payload && payload.kind === "connected") {
      return null;
    }
    if ("kind" in payload && payload.kind === "heartbeat") {
      return null;
    }
    if ("type" in payload && (payload as { type?: string }).type === "connected") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function parseSseChunk(raw: string): RealtimeStreamPayload | null {
  const dataLines = raw
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  for (const data of dataLines) {
    const payload = parseSseDataLine(data);
    if (payload) {
      return payload;
    }
  }

  return null;
}

export async function connectRealtimeStream(
  accessToken: string,
  onPayload: (payload: RealtimeStreamPayload) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/notifications/stream`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Realtime stream failed (${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const payload = parseSseChunk(part);
      if (payload) {
        onPayload(payload);
      }
    }
  }
}
