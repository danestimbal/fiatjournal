import { ReflectionSession } from '../types';

export const GOOGLE_DRIVE_FOLDER_NAME = 'Fiat Journal';

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  appProperties?: Record<string, string>;
}

/**
 * Formats a ReflectionSession note into valid Markdown with YAML frontmatter
 */
export function formatNoteAsMarkdownWithFrontmatter(note: ReflectionSession): string {
  const frontmatter = [
    '---',
    `id: "${note.id}"`,
    `title: "${(note.title || 'Untitled Journal').replace(/"/g, '\\"')}"`,
    `created: ${new Date(note.createdAt).toISOString()}`,
    `updated: ${new Date(note.updatedAt).toISOString()}`,
    `mode: "${note.mode || 'reflection'}"`,
    note.folder ? `folder: "${note.folder}"` : 'folder: "Notes"',
    note.tags && note.tags.length > 0 ? `tags: [${note.tags.map((t) => `"${t.replace(/"/g, '')}"`).join(', ')}]` : 'tags: []',
    note.isFavorite ? 'favorite: true' : null,
    note.isPinned ? 'pinned: true' : null,
    '---',
    '',
    note.content || '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return frontmatter;
}

/**
 * Parses Markdown with YAML frontmatter back into a ReflectionSession note
 */
export function parseMarkdownToNote(fileContent: string, fileId: string, fileName: string): Partial<ReflectionSession> {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  
  if (!match) {
    // Plain markdown without frontmatter
    const title = fileName.replace(/\.md$/i, '');
    return {
      id: fileId,
      title: title || 'Untitled Reflection',
      content: fileContent,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folder: 'Notes',
      tags: [],
      mode: 'reflection',
      turns: [],
    };
  }

  const rawYaml = match[1];
  const markdownBody = match[2] || '';

  // Simple, safe YAML parser for the specific frontmatter keys
  let id = fileId;
  let title = fileName.replace(/\.md$/i, '');
  let createdAt = Date.now();
  let updatedAt = Date.now();
  let folder = 'Notes';
  let mode: 'reflection' | 'brainstorm' | 'summary' = 'reflection';
  const tags: string[] = [];
  let isFavorite = false;
  let isPinned = false;

  const lines = rawYaml.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();

    // Strip wrapping quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (key === 'id' && val) id = val;
    if (key === 'title' && val) title = val;
    if (key === 'folder' && val) folder = val;
    if (key === 'created') {
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) createdAt = parsed;
    }
    if (key === 'updated') {
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) updatedAt = parsed;
    }
    if (key === 'mode' && (val === 'reflection' || val === 'brainstorm' || val === 'summary')) {
      mode = val;
    }
    if (key === 'favorite') isFavorite = val === 'true';
    if (key === 'pinned') isPinned = val === 'true';
    if (key === 'tags') {
      const arrayMatch = val.match(/\[(.*?)\]/);
      if (arrayMatch) {
        const items = arrayMatch[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        tags.push(...items);
      }
    }
  }

  return {
    id,
    title,
    content: markdownBody.trim(),
    createdAt,
    updatedAt,
    folder,
    tags,
    mode,
    isFavorite,
    isPinned,
    turns: [],
  };
}

/**
 * Searches for or creates the dedicated "Fiat Journal" folder on Google Drive
 */
export async function findOrCreateFiatJournalFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${GOOGLE_DRIVE_FOLDER_NAME}' and trashed = false`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Google Drive API search failed: ${searchRes.status} ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: GOOGLE_DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dedicated sanctuary for Fiat Journal reflections and notes in Markdown format',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Drive folder: ${createRes.status} ${errText}`);
  }

  const createdData = await createRes.json();
  return createdData.id;
}

/**
 * Saves or updates a reflection note in Google Drive
 */
export async function saveNoteToGoogleDrive(
  accessToken: string,
  note: ReflectionSession,
  folderId?: string
): Promise<{ fileId: string; webViewLink?: string }> {
  const targetFolderId = folderId || (await findOrCreateFiatJournalFolder(accessToken));
  const fileName = `${(note.title || 'Untitled Journal').replace(/[/\\?%*:|"<>]/g, '-').trim() || 'journal'}.md`;
  const markdownContent = formatNoteAsMarkdownWithFrontmatter(note);

  // Search if a file with this note ID already exists in the folder
  const query = encodeURIComponent(
    `'${targetFolderId}' in parents and trashed = false and (name = '${fileName.replace(/'/g, "\\'")}' or appProperties has { key='noteId' and value='${note.id}' })`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  let existingFileId: string | null = null;
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      existingFileId = data.files[0].id;
    }
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'text/markdown',
    parents: existingFileId ? undefined : [targetFolderId],
    appProperties: {
      noteId: note.id,
      app: 'FiatJournal',
      updatedAt: note.updatedAt.toString(),
    },
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    markdownContent +
    closeDelimiter;

  if (existingFileId) {
    // Update existing file
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update note in Google Drive: ${updateRes.status} ${err}`);
    }

    const updated = await updateRes.json();
    return { fileId: updated.id, webViewLink: updated.webViewLink };
  } else {
    // Create new file
    const createRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to save note to Google Drive: ${createRes.status} ${err}`);
    }

    const created = await createRes.json();
    return { fileId: created.id, webViewLink: created.webViewLink };
  }
}

/**
 * Deletes a note file from Google Drive (moves to trash)
 */
export async function deleteNoteFromGoogleDrive(
  accessToken: string,
  noteId: string,
  folderId?: string
): Promise<void> {
  const targetFolderId = folderId || (await findOrCreateFiatJournalFolder(accessToken));
  const query = encodeURIComponent(
    `'${targetFolderId}' in parents and trashed = false and appProperties has { key='noteId' and value='${noteId}' }`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      const fileId = data.files[0].id;
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }
}

/**
 * Lists all Markdown reflection files from the dedicated Google Drive folder
 */
export async function listNotesFromGoogleDrive(
  accessToken: string,
  folderId?: string
): Promise<ReflectionSession[]> {
  const targetFolderId = folderId || (await findOrCreateFiatJournalFolder(accessToken));
  const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);

  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink,appProperties)&pageSize=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listRes.ok) {
    throw new Error(`Failed to list files from Google Drive: ${listRes.status}`);
  }

  const listData = await listRes.json();
  const files: DriveFileItem[] = listData.files || [];
  const notes: ReflectionSession[] = [];

  for (const file of files) {
    if (!file.name.endsWith('.md') && file.mimeType !== 'text/markdown' && file.mimeType !== 'text/plain') {
      continue;
    }

    try {
      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (contentRes.ok) {
        const text = await contentRes.text();
        const parsed = parseMarkdownToNote(text, file.id, file.name);
        notes.push({
          id: parsed.id || file.id,
          userId: 'google-drive-user',
          title: parsed.title || file.name.replace(/\.md$/, ''),
          content: parsed.content || '',
          folder: parsed.folder || 'Notes',
          tags: parsed.tags || [],
          mode: parsed.mode || 'reflection',
          isFavorite: parsed.isFavorite || false,
          isPinned: parsed.isPinned || false,
          createdAt: parsed.createdAt || Date.now(),
          updatedAt: parsed.updatedAt || Date.now(),
          turns: [],
        });
      }
    } catch (e) {
      console.warn(`Error reading file ${file.name} from Google Drive:`, e);
    }
  }

  return notes;
}

/**
 * Mass syncs notes to Google Drive
 */
export async function syncAllNotesToGoogleDrive(
  accessToken: string,
  notes: ReflectionSession[],
  onProgress?: (current: number, total: number) => void
): Promise<{ folderId: string; syncedCount: number }> {
  const folderId = await findOrCreateFiatJournalFolder(accessToken);
  let synced = 0;

  for (let i = 0; i < notes.length; i++) {
    try {
      await saveNoteToGoogleDrive(accessToken, notes[i], folderId);
      synced++;
      if (onProgress) onProgress(synced, notes.length);
    } catch (err) {
      console.warn(`Error syncing note ${notes[i].id} to Google Drive:`, err);
    }
  }

  return { folderId, syncedCount: synced };
}
