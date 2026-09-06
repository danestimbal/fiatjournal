import { ReflectionMode, ReflectionTurn } from '../types';

export interface ReflectResponse {
  reply: string;
  modelUsed: string;
}

export interface SummarizeResponse {
  title: string;
  summary: string;
  keyInsights: string[];
  modelUsed: string;
}

export async function reflectWithGemini(params: {
  message: string;
  history: ReflectionTurn[];
  mode: ReflectionMode;
  noteContext?: string;
}): Promise<ReflectResponse> {
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.message,
      history: params.history.map((t) => ({
        role: t.role,
        content: t.content,
      })),
      mode: params.mode,
      noteContext: params.noteContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Server responded with status ${response.status}`
    );
  }

  return response.json();
}

export async function summarizeSession(params: {
  entries: ReflectionTurn[];
  title?: string;
}): Promise<SummarizeResponse> {
  const response = await fetch('/api/summarize-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entries: params.entries.map((t) => ({
        role: t.role,
        content: t.content,
      })),
      title: params.title,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Server responded with status ${response.status}`
    );
  }

  return response.json();
}
