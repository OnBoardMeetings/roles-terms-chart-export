export const patternCategories = [
  {
    id: 'loading-states',
    title: 'Loading & Streaming',
    description: 'Visual feedback while content is being generated',
    patterns: [
      {
        id: 'typing-indicator',
        title: 'Typing Indicator',
        description: 'Animated dots showing the agent is thinking',
        example: 'Three animated dots that pulse',
        code: `<div class="flex space-x-1">
  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
  <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
</div>`,
        useCases: ['Initial response delay', 'Between tool executions', 'Processing requests']
      },
      {
        id: 'streaming-text',
        title: 'Streaming Text',
        description: 'Character-by-character text reveal',
        example: 'Text appears progressively with cursor',
        code: `const streamText = async (text, callback) => {
  for (let i = 0; i < text.length; i++) {
    await new Promise(r => setTimeout(r, 20));
    callback(text.slice(0, i + 1));
  }
};`,
        useCases: ['Long responses', 'Creating anticipation', 'Real-time generation']
      },
      {
        id: 'skeleton-loader',
        title: 'Skeleton Loader',
        description: 'Placeholder UI for structured content',
        example: 'Gray animated boxes matching expected layout',
        code: `<div class="animate-pulse space-y-3">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded w-full"></div>
  <div class="h-4 bg-gray-200 rounded w-5/6"></div>
</div>`,
        useCases: ['Cards', 'Tables', 'Lists', 'Known structure']
      }
    ]
  },
  {
    id: 'tool-execution',
    title: 'Tool Execution',
    description: 'Visualizing agent actions and API calls',
    patterns: [
      {
        id: 'single-tool',
        title: 'Single Tool Call',
        description: 'Display a single tool being executed',
        example: 'Icon + tool name + status indicator',
        code: `:::tool{name="search_papers" status="running"}
Searching academic databases...
:::`,
        useCases: ['Simple queries', 'Single action needed', 'Sequential flow']
      },
      {
        id: 'parallel-tools',
        title: 'Parallel Tool Execution',
        description: 'Show multiple tools running simultaneously',
        example: 'Multiple tool cards with progress bars',
        code: `:::tools{mode="parallel"}
- search_google_drive [completed]
- search_sharepoint [running]
- search_local_files [queued]
:::`,
        useCases: ['Comprehensive search', 'Data aggregation', 'Faster results']
      },
      {
        id: 'tool-chain',
        title: 'Sequential Tool Chain',
        description: 'Timeline showing order of execution',
        example: 'Connected nodes showing progression',
        code: `:::tools{mode="sequential"}
1. authenticate_user ✓
2. fetch_calendar_data ✓
3. process_events ⋯
4. generate_summary
:::`,
        useCases: ['Dependencies between tools', 'Multi-step workflows', 'Clear progression']
      }
    ]
  },
  {
    id: 'citations',
    title: 'Citations & Sources',
    description: 'Attributing information to sources',
    patterns: [
      {
        id: 'inline-citations',
        title: 'Inline Citations',
        description: 'Numbered references in text',
        example: 'According to the study[1], AI safety...',
        markdown: 'According to the study[1], AI safety is important.',
        code: `// Markdown
According to the study[1], AI safety is important.

// Will render with hover tooltip on [1]`,
        useCases: ['Academic content', 'Research summaries', 'Multiple sources']
      },
      {
        id: 'source-cards',
        title: 'Source Cards',
        description: 'Rich citation cards with metadata',
        example: 'Card with title, authors, year, excerpt',
        markdown: `:::source{id="1"}
title: AI Safety Research
authors: Smith, J. et al.
year: 2024
publication: Nature
excerpt: Recent advances in AI safety...
url: https://example.com/paper
:::`,
        useCases: ['Detailed attribution', 'Multiple metadata', 'External links']
      },
      {
        id: 'footnotes',
        title: 'Footnote Style',
        description: 'Traditional footnote markers',
        example: 'Superscript numbers with references section',
        markdown: 'Some claim this is true[^1].\n\n[^1]: Smith, 2024',
        useCases: ['Traditional documents', 'Many citations', 'End-of-content refs']
      }
    ]
  },
  {
    id: 'interactive',
    title: 'Interactive Elements',
    description: 'Buttons, actions, and user interactions',
    patterns: [
      {
        id: 'suggested-actions',
        title: 'Suggested Actions',
        description: 'Button chips for follow-up queries',
        example: 'Pills with suggested questions',
        markdown: `:::actions
- Explain RLHF in detail
- Show comparison table
- Recent breakthroughs
:::`,
        useCases: ['Guiding conversation', 'Common follow-ups', 'Discovery']
      },
      {
        id: 'code-blocks',
        title: 'Code Blocks',
        description: 'Syntax-highlighted code with copy button',
        example: 'Code with language tag and copy button',
        markdown: '```javascript\nconst x = 42;\n```',
        useCases: ['Code examples', 'Commands', 'Configuration']
      },
      {
        id: 'collapsible',
        title: 'Collapsible Sections',
        description: 'Expandable content sections',
        example: 'Details/summary accordion',
        markdown: `:::details
### Advanced Usage
Additional content here...
:::`,
        useCases: ['Optional details', 'Long content', 'Progressive disclosure']
      }
    ]
  },
  {
    id: 'products',
    title: 'Product Objects',
    description: 'Structured data cards',
    patterns: [
      {
        id: 'document-cards',
        title: 'Document Cards',
        description: 'File information with actions',
        example: 'Card showing title, type, size, preview',
        markdown: `:::document{id="1"}
title: Q4 Report
type: PDF
size: 2.4 MB
date: 2024-12-15
author: Finance Team
preview: Quarterly financial analysis...
url: /documents/q4.pdf
:::`,
        useCases: ['Search results', 'File listings', 'Document management']
      },
      {
        id: 'meeting-cards',
        title: 'Meeting Cards',
        description: 'Calendar event information',
        example: 'Card with date, time, participants, actions',
        markdown: `:::meeting{id="1"}
title: Team Standup
date: 2024-12-18
time: 10:00 AM
duration: 30 min
participants: Team A
status: upcoming
:::`,
        useCases: ['Calendar queries', 'Schedule display', 'Meeting management']
      },
      {
        id: 'data-tables',
        title: 'Data Tables',
        description: 'Sortable markdown tables',
        example: 'Table with headers and sortable columns',
        markdown: `| Name | Value | Change |
|------|-------|--------|
| A    | 100   | +10%   |
| B    | 80    | -5%    |`,
        useCases: ['Structured data', 'Comparisons', 'Analytics']
      }
    ]
  },
  {
    id: 'feedback',
    title: 'Errors & Feedback',
    description: 'Error states and informational messages',
    patterns: [
      {
        id: 'error-state',
        title: 'Error Messages',
        description: 'Clear error communication',
        example: 'Red box with error details and retry button',
        markdown: `:::error
**API Connection Failed**
Unable to connect to the service.
Please try again.
:::`,
        useCases: ['Failed operations', 'API errors', 'Validation errors']
      },
      {
        id: 'info-boxes',
        title: 'Info Boxes',
        description: 'Notes, tips, and warnings',
        example: 'Colored boxes with icons',
        markdown: `:::info
**Note:** This is important information.
:::`,
        useCases: ['Additional context', 'Warnings', 'Tips']
      },
      {
        id: 'progress-bars',
        title: 'Progress Indicators',
        description: 'Long-running operation progress',
        example: 'Progress bar with percentage',
        code: `<div class="w-full bg-gray-200 rounded">
  <div class="bg-blue-500 h-2 rounded" 
       style="width: 65%"></div>
</div>`,
        useCases: ['File uploads', 'Data processing', 'Long queries']
      }
    ]
  }
];

export function getCategory(id) {
  return patternCategories.find(c => c.id === id);
}

export function getPattern(categoryId, patternId) {
  const category = getCategory(categoryId);
  return category?.patterns.find(p => p.id === patternId);
}

export function getAllPatterns() {
  return patternCategories.flatMap(c => 
    c.patterns.map(p => ({ ...p, categoryId: c.id, categoryTitle: c.title }))
  );
}
