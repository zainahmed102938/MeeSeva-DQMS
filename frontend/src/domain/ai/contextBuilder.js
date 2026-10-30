/**
 * Structured AI Context Builder.
 * Compiles relevant development context (Project, Task, Bug, Current File, Selection, Diagnostics, Git Branch)
 * without unnecessarily bloating prompts.
 */

export const buildAIContext = ({
  project = null,
  activeTask = null,
  activeBug = null,
  currentFile = '',
  fileContent = '',
  selectedCode = '',
  cursorPosition = null,
  diagnostics = [],
  gitBranch = 'main',
  actionType = 'general', // 'explain' | 'fix' | 'generate' | 'refactor' | 'debug' | 'test' | 'review'
}) => {
  // Truncate file content if excessively large (keep up to ~8000 chars)
  const truncatedContent = fileContent.length > 8000 
    ? fileContent.substring(0, 8000) + '\n\n/* ... [truncated by Context Builder] ... */'
    : fileContent;

  const relevantDiagnostics = diagnostics
    .filter(d => d.type !== 'success')
    .slice(0, 10);

  const contextPayload = {
    project: project ? {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status
    } : null,
    task: activeTask ? {
      id: activeTask.id,
      title: activeTask.title,
      description: activeTask.description,
      status: activeTask.status,
      priority: activeTask.priority,
      storyPoints: activeTask.storyPoints,
      gitBranch: activeTask.gitBranch,
      subtasks: activeTask.subtasks
    } : null,
    bug: activeBug ? {
      id: activeBug.id,
      title: activeBug.title,
      steps: activeBug.steps,
      severity: activeBug.severity,
      status: activeBug.status,
      gitBranch: activeBug.gitBranch
    } : null,
    file: {
      path: currentFile,
      language: getLanguageFromFilename(currentFile),
      content: truncatedContent
    },
    selection: selectedCode ? selectedCode.substring(0, 2000) : null,
    cursor: cursorPosition,
    diagnostics: relevantDiagnostics.length > 0 ? relevantDiagnostics : null,
    git: {
      activeBranch: gitBranch
    },
    actionType
  };

  return {
    raw: contextPayload,
    systemInstruction: formatSystemInstruction(contextPayload),
    contextSummary: summarizeContext(contextPayload)
  };
};

export const getLanguageFromFilename = (filename = '') => {
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.jsx')) return 'javascriptreact';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.tsx')) return 'typescriptreact';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.md')) return 'markdown';
  if (filename.includes('Dockerfile')) return 'dockerfile';
  if (filename.endsWith('.sql')) return 'sql';
  if (filename.endsWith('.py')) return 'python';
  return 'plaintext';
};

const formatSystemInstruction = (ctx) => {
  let prompt = `You are the Embedded AI Engineering Copilot. You are an expert software engineer pair-programming inside the Development Workspace.\n`;
  prompt += `Your goal is to provide precise, high-quality, production-ready code assistance.\n\n`;

  if (ctx.project) {
    prompt += `ACTIVE PROJECT: ${ctx.project.name} (${ctx.project.description || 'No description'})\n`;
  }
  if (ctx.task) {
    prompt += `LINKED TASK: [${ctx.task.id}] "${ctx.task.title}" (Status: ${ctx.task.status})\nDescription: ${ctx.task.description || 'N/A'}\n`;
  }
  if (ctx.bug) {
    prompt += `LINKED DEFECT: [${ctx.bug.id}] "${ctx.bug.title}" (Severity: ${ctx.bug.severity})\nRepro steps: ${ctx.bug.steps || 'N/A'}\n`;
  }
  if (ctx.file?.path) {
    prompt += `CURRENT FILE: ${ctx.file.path} (Language: ${ctx.file.language})\n`;
  }
  if (ctx.selection) {
    prompt += `SELECTED CODE SNIPPET:\n\`\`\`${ctx.file.language}\n${ctx.selection}\n\`\`\`\n`;
  }
  if (ctx.diagnostics && ctx.diagnostics.length > 0) {
    prompt += `CURRENT DIAGNOSTICS/ERRORS:\n`;
    ctx.diagnostics.forEach((d, i) => {
      prompt += `  ${i + 1}. [${d.type.toUpperCase()}] Line ${d.line}: ${d.message}\n`;
    });
  }

  prompt += `\nINSTRUCTIONS:\n`;
  prompt += `1. When proposing code modifications, output complete, valid code inside a standard markdown code block (\`\`\`language ... \`\`\`).\n`;
  prompt += `2. Do not output fragmented snippets unless explicitly asked. The code will be diffed against the active buffer.\n`;
  prompt += `3. Maintain strict security: avoid hardcoding credentials, handle potential edge cases, and validate inputs.\n`;

  return prompt;
};

const summarizeContext = (ctx) => {
  const parts = [];
  if (ctx.project) parts.push(`Project: ${ctx.project.name}`);
  if (ctx.task) parts.push(`Task: ${ctx.task.title}`);
  if (ctx.bug) parts.push(`Bug: ${ctx.bug.title}`);
  if (ctx.file?.path) parts.push(`File: ${ctx.file.path}`);
  return parts.join(' | ');
};
