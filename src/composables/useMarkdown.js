import MarkdownIt from 'markdown-it';

// Custom plugin for citations
function citationPlugin(md) {
  // Inline citation pattern: [1], [2], etc.
  md.inline.ruler.after('emphasis', 'citation', (state, silent) => {
    const max = state.posMax;
    const start = state.pos;
    
    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false;
    if (start + 2 >= max) return false;
    
    let pos = start + 1;
    let num = '';
    
    while (pos < max && state.src.charCodeAt(pos) >= 0x30 && state.src.charCodeAt(pos) <= 0x39) {
      num += state.src[pos];
      pos++;
    }
    
    if (!num || state.src.charCodeAt(pos) !== 0x5D /* ] */) return false;
    
    if (!silent) {
      const token = state.push('citation_inline', 'span', 0);
      token.content = num;
      token.attrSet('class', 'citation-marker');
      token.attrSet('data-citation-id', num);
    }
    
    state.pos = pos + 1;
    return true;
  });
  
  md.renderer.rules.citation_inline = (tokens, idx) => {
    const token = tokens[idx];
    const id = token.content;
    return `<span class="inline-flex items-center justify-center px-1.5 ml-1 text-sm font-semibold text-primary-700 bg-primary-100 rounded cursor-pointer hover:bg-primary-200 transition-colors citation-marker" data-citation-id="${id}">${id}</span>`;
  };
}

// Custom plugin for special blocks (:::type)
function blockPlugin(md) {
  const containerRegex = /^:::(\w+)(?:\{(.+?)\})?\s*$/;
  
  md.block.ruler.before('fence', 'custom_block', (state, startLine, endLine, silent) => {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    
    const firstLine = state.src.slice(pos, max);
    const match = firstLine.match(containerRegex);
    
    if (!match) return false;
    
    const type = match[1];
    const attrs = match[2] || '';
    
    if (silent) return true;
    
    // Find closing delimiter
    // For 'sources' type, look for :::: (4 colons) to allow nested ::: blocks
    // For other types, look for ::: (3 colons)
    const closingDelimiter = type === 'sources' ? '::::' : ':::';

    let nextLine = startLine;
    let foundEnd = false;

    while (nextLine < endLine) {
      nextLine++;
      if (nextLine >= endLine) break;

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (state.src.slice(pos, max).trim() === closingDelimiter) {
        foundEnd = true;
        break;
      }
    }

    if (!foundEnd) return false;
    
    const oldLineMax = state.lineMax;
    state.lineMax = nextLine;
    
    const token = state.push('custom_block_open', 'div', 1);
    token.info = type;
    token.meta = attrs;
    token.markup = ':::';
    
    const content = state.getLines(startLine + 1, nextLine, 0, false);
    const contentToken = state.push('custom_block_content', '', 0);
    contentToken.content = content;
    contentToken.info = type;
    contentToken.meta = attrs;
    
    const closeToken = state.push('custom_block_close', 'div', -1);
    closeToken.markup = ':::';
    
    state.line = nextLine + 1;
    state.lineMax = oldLineMax;
    
    return true;
  });
  
  md.renderer.rules.custom_block_open = (tokens, idx) => {
    const token = tokens[idx];
    const type = token.info;
    const attrs = parseAttrs(token.meta);
    
    const classes = {
      source: 'source-card border-l-4 border-primary-500 bg-gray-50 p-4 rounded-r-lg mb-4',
      sources: 'sources-container',
      document: 'document-card border border-gray-200 bg-white rounded-lg p-3 mb-3 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all',
      meeting: 'meeting-card border border-gray-200 bg-white rounded-lg p-3 mb-3 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all',
      details: 'details-block border border-gray-200 rounded-lg mb-4 overflow-hidden',
      error: 'error-box bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4',
      info: 'info-box bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4',
      warning: 'warning-box bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4',
      actions: 'actions-container flex flex-wrap gap-2 my-4',
      tool: 'tool-execution-item border border-gray-200 rounded-lg p-3 mb-2',
      tools: 'tools-container space-y-2 my-4'
    };
    
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(' ');
    
    return `<div class="${classes[type] || 'custom-block'}" data-block-type="${type}" ${attrString}>`;
  };
  
  md.renderer.rules.custom_block_content = (tokens, idx) => {
    const token = tokens[idx];
    const type = token.info;
    const attrs = parseAttrs(token.meta);
    const content = token.content.trim();
    
    // Special rendering for specific types
    if (type === 'source') {
      return renderSourceCard(content, attrs);
    } else if (type === 'document') {
      return renderDocumentCard(content, attrs);
    } else if (type === 'meeting') {
      return renderMeetingCard(content, attrs);
    } else if (type === 'details') {
      return renderDetails(content, attrs);
    } else if (type === 'actions') {
      return renderActions(content);
    } else if (type === 'tool' || type === 'tools') {
      return renderTools(content, attrs);
    } else if (type === 'sources') {
      return renderSources(content, attrs);
    } else {
      // Default: render as markdown
      const md = new MarkdownIt();
      return md.render(content);
    }
  };
  
  md.renderer.rules.custom_block_close = () => {
    return '</div>';
  };
}

function parseAttrs(str) {
  if (!str) return {};
  const attrs = {};
  const regex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    attrs[match[1]] = match[2];
  }
  // Also handle {id="1"} and {id=1} formats
  const simpleRegex = /(\w+)=(\w+)/g;
  while ((match = simpleRegex.exec(str)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function renderSourceCard(content, attrs) {
  const lines = content.split('\n').filter(l => l.trim());
  const data = {};
  lines.forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      data[key.trim()] = values.join(':').trim();
    }
  });
  
  return `
    <div class="source-content source-card" data-source-id="${attrs.id || ''}">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-900">${data.title || 'Source'}</div>
          ${data.authors ? `<div class="text-xs text-gray-600 mt-1">${data.authors}${data.year ? ` (${data.year})` : ''}</div>` : ''}
          ${data.publication ? `<div class="text-xs text-gray-500 mt-0.5">${data.publication}</div>` : ''}
        </div>
        ${attrs.id ? `<span class="citation-badge text-sm font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded">${attrs.id}</span>` : ''}
      </div>
      ${data.excerpt ? `<p class="text-sm text-gray-700 mt-2 italic">"${data.excerpt}"</p>` : ''}
      ${data.url ? `<a href="${data.url}" target="_blank" class="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center">View source →</a>` : ''}
    </div>
  `;
}

function renderDocumentCard(content, attrs) {
  const lines = content.split('\n').filter(l => l.trim());
  const data = {};
  lines.forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      data[key.trim()] = values.join(':').trim();
    }
  });

  // Parse date for calendar cell
  let dayNum = '';
  let monthAbbr = '';
  if (data.date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = data.date;
    const longMatch = dateStr.match(/(\w+)\s+(\d+)/);
    if (longMatch) {
      const monthName = longMatch[1];
      dayNum = longMatch[2];
      const monthIndex = months.findIndex(m => monthName.toLowerCase().startsWith(m.toLowerCase()));
      monthAbbr = monthIndex >= 0 ? months[monthIndex] : monthName.substring(0, 3);
    }
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      dayNum = parseInt(isoMatch[3], 10).toString();
      monthAbbr = months[parseInt(isoMatch[2], 10) - 1];
    }
  }

  const hasDateCell = dayNum && monthAbbr;
  const sectionInfo = data.section ? data.section : '';

  return `<div class="flex gap-3">${hasDateCell ? `<div class="flex-shrink-0 w-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center self-stretch"><span class="text-xl font-semibold text-gray-900 leading-none">${dayNum}</span><span class="text-xs text-gray-500">${monthAbbr}</span></div>` : ''}<div class="flex-1 min-w-0 flex flex-col">${sectionInfo ? `<div class="text-sm text-gray-500">${sectionInfo}</div>` : ''}<div class="font-medium text-gray-900">${data.title || 'Document'}</div>${data.url ? `<div class="flex items-center gap-2 mt-2"><a href="${data.url}" class="no-underline hover:no-underline inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" style="text-decoration:none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>Open Book</a></div>` : ''}</div></div>`;
}

function renderMeetingCard(content, attrs) {
  const lines = content.split('\n').filter(l => l.trim());
  const data = {};
  lines.forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      data[key.trim()] = values.join(':').trim();
    }
  });

  // Parse date for calendar cell (expects format like "February 24, 2026" or "2026-02-24")
  let dayNum = '';
  let monthAbbr = '';
  if (data.date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = data.date;

    // Try parsing "Month Day, Year" format
    const longMatch = dateStr.match(/(\w+)\s+(\d+)/);
    if (longMatch) {
      const monthName = longMatch[1];
      dayNum = longMatch[2];
      const monthIndex = months.findIndex(m => monthName.toLowerCase().startsWith(m.toLowerCase()));
      monthAbbr = monthIndex >= 0 ? months[monthIndex] : monthName.substring(0, 3);
    }

    // Try parsing ISO format "YYYY-MM-DD"
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      dayNum = parseInt(isoMatch[3], 10).toString();
      monthAbbr = months[parseInt(isoMatch[2], 10) - 1];
    }
  }

  const timeDisplay = data.time || '';
  const hasDateCell = dayNum && monthAbbr;

  const hasButtons = data.url || data.joinUrl;

  return `<div class="flex gap-3">${hasDateCell ? `<div class="flex-shrink-0 w-14 bg-gray-100 rounded-lg flex flex-col items-center justify-center self-stretch"><span class="text-xl font-semibold text-gray-900 leading-none">${dayNum}</span><span class="text-xs text-gray-500">${monthAbbr}</span></div>` : ''}<div class="flex-1 min-w-0 flex flex-col">${timeDisplay ? `<div class="text-sm text-gray-500">${timeDisplay}</div>` : ''}<div class="font-medium text-gray-900">${data.title || 'Meeting'}</div>${hasButtons ? `<div class="flex items-center gap-2 mt-2">${data.url ? `<a href="${data.url}" class="no-underline hover:no-underline inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" style="text-decoration:none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>Open Book</a>` : ''}${data.joinUrl ? `<a href="${data.joinUrl}" class="no-underline hover:no-underline inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" style="text-decoration:none"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Join</a>` : ''}</div>` : ''}</div></div>`;
}

function renderDetails(content, attrs) {
  const lines = content.split('\n');
  const summary = lines[0].replace(/^#+\s*/, '').trim();
  const body = lines.slice(1).join('\n');
  
  // Use the same markdown instance with custom blocks support
  const idAttr = attrs.id ? ` id="${attrs.id}"` : '';
  
  return `
    <details class="details-content"${idAttr}>
      <summary class="cursor-pointer px-4 py-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors">${summary}</summary>
      <div class="px-4 py-3 border-t border-gray-200">
        ${body}
      </div>
    </details>
  `;
}

function renderActions(content) {
  const actions = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());
  
  return actions.map(action => 
    `<button class="action-button px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors" data-action="${action}">${action}</button>`
  ).join('');
}

function renderTools(content, attrs) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (attrs.mode === 'parallel' || attrs.mode === 'sequential') {
    return lines.map(line => {
      const match = line.match(/^-?\s*(.+?)\s*\[(\w+)\]$/);
      if (match) {
        const [, name, status] = match;
        const statusIcons = {
          completed: '✓',
          running: '⋯',
          queued: '○',
          failed: '✗'
        };
        const statusColors = {
          completed: 'text-green-600',
          running: 'text-blue-600',
          queued: 'text-gray-400',
          failed: 'text-red-600'
        };
        return `<div class="flex items-center space-x-2 text-sm"><span class="${statusColors[status]}">${statusIcons[status] || '○'}</span><span>${name}</span></div>`;
      }
      return '';
    }).join('');
  }
  
  return `<div class="text-sm text-gray-700">${content}</div>`;
}

function renderSources(content, attrs) {
  // Parse source blocks manually since nested ::: blocks don't work with the parser
  // Format: :::source{id="1"}\nkey: value\nkey: value\n:::
  const sourceRegex = /:::source\{([^}]*)\}([\s\S]*?):::/g;
  const sources = [];
  let match;

  while ((match = sourceRegex.exec(content)) !== null) {
    const attrStr = match[1];
    const sourceContent = match[2].trim();
    const sourceAttrs = parseAttrs(attrStr);
    sources.push({ attrs: sourceAttrs, content: sourceContent });
  }

  const sourceCount = sources.length;
  const label = attrs.label || `${sourceCount} source${sourceCount !== 1 ? 's' : ''}`;

  // Render each source card
  const renderedSources = sources.map(source => {
    return `<div class="source-card border-l-4 border-primary-500 bg-gray-50 p-4 rounded-r-lg mb-3 last:mb-0">${renderSourceCard(source.content, source.attrs)}</div>`;
  }).join('');

  return `
    <details class="sources-collapsible">
      <summary class="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 select-none">
        <svg class="w-4 h-4 transition-transform sources-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="font-medium">${label}</span>
      </summary>
      <div class="sources-content mt-2">
        ${renderedSources}
      </div>
    </details>
  `;
}

export function useMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  });

  // Add custom plugins
  md.use(citationPlugin);
  md.use(blockPlugin);

  // Plain markdown renderer (no custom plugins)
  const mdPlain = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  });

  const render = (text) => {
    if (!text) return '';
    return md.render(text);
  };

  // Convert custom blocks to plain text and render as markdown
  const renderPlain = (text) => {
    if (!text) return '';
    let cleaned = text;

    // Convert :::meeting blocks to plain text
    cleaned = cleaned.replace(/:::meeting\{[^}]*\}\n([\s\S]*?):::/g, (match, content) => {
      const lines = content.trim().split('\n');
      const data = {};
      lines.forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
          data[key.trim()] = values.join(':').trim();
        }
      });
      const title = data.title || 'Meeting';
      const date = data.date || '';
      const time = data.time || '';
      return `**${title}**\n${date}${time ? ' at ' + time : ''}\n`;
    });

    // Convert :::document blocks to plain text
    cleaned = cleaned.replace(/:::document\{[^}]*\}\n([\s\S]*?):::/g, (match, content) => {
      const lines = content.trim().split('\n');
      const data = {};
      lines.forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
          data[key.trim()] = values.join(':').trim();
        }
      });
      const title = data.title || 'Document';
      const section = data.section || '';
      return `*Source: ${title}${section ? ', ' + section : ''}*\n`;
    });

    // Convert :::source blocks to plain markdown links
    cleaned = cleaned.replace(/:::source\{[^}]*\}\n([\s\S]*?):::/g, (match, content) => {
      const lines = content.trim().split('\n');
      const data = {};
      lines.forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
          data[key.trim()] = values.join(':').trim().replace(/^"|"$/g, '');
        }
      });
      const title = data.title || 'Source';
      const url = data.url || '';
      const authors = data.authors || '';
      const year = data.year || '';
      const meta = [authors, year].filter(Boolean).join(' · ');
      return url
        ? `[${title}](${url})${meta ? ' · ' + meta : ''}\n`
        : `${title}${meta ? ' · ' + meta : ''}\n`;
    });
    cleaned = cleaned.replace(/:::sources\n?/g, '');
    // Remove other ::: blocks entirely
    cleaned = cleaned.replace(/:::\w+(?:\{[^}]*\})?[\s\S]*?:::/g, '');
    // Remove :::: blocks (sources container closing)
    cleaned = cleaned.replace(/::::\s*/g, '');
    // Remove citation markers [1], [2], etc.
    cleaned = cleaned.replace(/\[(\d+)\]/g, '');
    // Clean up excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return mdPlain.render(cleaned.trim());
  };

  return {
    render,
    renderPlain
  };
}
