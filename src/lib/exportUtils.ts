import JSZip from 'jszip';
import { ReflectionSession } from '../types';

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'untitled';
}

function markdownToBasicHtml(md: string): string {
  // Simple, safe Markdown to HTML converter for standalone export
  let html = md
    // Escape HTML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    // Checkboxes
    .replace(/\[ \]/g, '<input type="checkbox" disabled /> ')
    .replace(/\[x\]/gi, '<input type="checkbox" checked disabled /> ')
    // Line breaks to paragraphs
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h1') ||
        trimmed.startsWith('<h2') ||
        trimmed.startsWith('<h3') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

export function exportNoteAsMarkdown(note: ReflectionSession): void {
  const frontmatter = [
    '---',
    `title: "${note.title.replace(/"/g, '\\"')}"`,
    `created: ${new Date(note.createdAt).toISOString()}`,
    `updated: ${new Date(note.updatedAt).toISOString()}`,
    note.folder ? `folder: "${note.folder}"` : null,
    note.tags && note.tags.length > 0 ? `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]` : null,
    '---',
    '',
    note.content || '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(note.title)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNoteAsHtml(note: ReflectionSession): void {
  const noteBodyHtml = markdownToBasicHtml(note.content || '*No content*');
  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title || 'Journal Reflection'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: #1c1917;
      background-color: #fafaf9;
      max-width: 760px;
      margin: 40px auto;
      padding: 0 24px;
    }
    header {
      border-bottom: 2px solid #e7e5e4;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #0c0a09;
      margin: 0 0 10px 0;
      line-height: 1.2;
    }
    .meta {
      font-size: 0.875rem;
      color: #78716c;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .tags {
      margin-top: 10px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tag {
      background: #e7e5e4;
      color: #44403c;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 500;
    }
    article {
      font-size: 1.05rem;
      color: #292524;
    }
    h2 { font-size: 1.5rem; margin-top: 24px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; }
    h3 { font-size: 1.25rem; margin-top: 20px; }
    blockquote {
      border-left: 4px solid #d6d3d1;
      padding-left: 16px;
      margin: 16px 0;
      color: #57534e;
      font-style: italic;
    }
    li { margin-bottom: 6px; }
    footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e7e5e4;
      font-size: 0.8rem;
      color: #a8a29e;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>${note.title || 'Untitled Reflection'}</h1>
    <div class="meta">
      <span>Date: ${formattedDate}</span>
      ${note.folder ? `<span>Folder: ${note.folder}</span>` : ''}
    </div>
    ${
      note.tags && note.tags.length > 0
        ? `<div class="tags">${note.tags.map((t) => `<span class="tag">#${t}</span>`).join('')}</div>`
        : ''
    }
  </header>
  <article>
    ${noteBodyHtml}
  </article>
  <footer>
    Exported from Fiat Journal Sanctuary &bull; Private &amp; Owner-Bound Storage
  </footer>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(note.title)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNoteAsPdf(note: ReflectionSession): void {
  const noteBodyHtml = markdownToBasicHtml(note.content || '*No content*');
  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print your PDF reflection document.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${note.title || 'Journal Reflection'}</title>
  <style>
    @media print {
      @page {
        margin: 20mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
      line-height: 1.6;
      color: #111;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 24pt;
      margin-bottom: 4pt;
      color: #111;
    }
    .meta {
      font-size: 10pt;
      color: #666;
      border-bottom: 1px solid #ccc;
      padding-bottom: 12pt;
      margin-bottom: 20pt;
    }
    article {
      font-size: 12pt;
    }
    h2 { font-size: 16pt; margin-top: 18pt; border-bottom: 0.5pt solid #eee; }
    h3 { font-size: 14pt; margin-top: 14pt; }
    blockquote {
      border-left: 3pt solid #888;
      padding-left: 12pt;
      margin: 12pt 0;
      color: #444;
      font-style: italic;
    }
    footer {
      margin-top: 40pt;
      border-top: 0.5pt solid #ccc;
      padding-top: 8pt;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${note.title || 'Untitled Reflection'}</h1>
  <div class="meta">
    Created: ${formattedDate} ${note.folder ? `| Folder: ${note.folder}` : ''}
    ${note.tags && note.tags.length > 0 ? `| Tags: ${note.tags.join(', ')}` : ''}
  </div>
  <article>
    ${noteBodyHtml}
  </article>
  <footer>
    Fiat Journal &bull; Distraction-Free Mindful Reflections
  </footer>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`);

  printWindow.document.close();
}

export async function exportVaultAsZip(
  notes: ReflectionSession[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();

  const rootFolder = zip.folder('fiat-journal-vault') || zip;

  // Group notes into folders or create flat notes
  notes.forEach((note, index) => {
    const folderName = note.folder ? sanitizeFilename(note.folder) : 'Inbox';
    const subFolder = rootFolder.folder(folderName) || rootFolder;
    const filename = `${sanitizeFilename(note.title || `note-${index + 1}`)}.md`;

    const content = [
      '---',
      `title: "${note.title.replace(/"/g, '\\"')}"`,
      `created: ${new Date(note.createdAt).toISOString()}`,
      `updated: ${new Date(note.updatedAt).toISOString()}`,
      `folder: "${folderName}"`,
      note.tags && note.tags.length > 0 ? `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]` : null,
      '---',
      '',
      note.content || '',
    ]
      .filter((line) => line !== null)
      .join('\n');

    subFolder.file(filename, content);
  });

  // Add index markdown manifest
  const manifestContent = `# Fiat Journal Vault Archive
Generated: ${new Date().toISOString()}
Total Reflections: ${notes.length}

## Note Manifest
${notes.map((n) => `- [${n.title}](${n.folder || 'Inbox'}/${sanitizeFilename(n.title)}.md) (${new Date(n.createdAt).toLocaleDateString()})`).join('\n')}
`;
  rootFolder.file('README.md', manifestContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(metadata.percent);
    }
  });

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fiat-journal-vault-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
