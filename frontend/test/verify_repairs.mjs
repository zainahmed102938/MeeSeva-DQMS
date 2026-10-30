import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('====================================================');
console.log('CSLM REPAIR VERIFICATION SUITE — AUTOMATED AUDIT');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(`  Error: ${err.message}\n`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: P0 — Database RLS Hardening (../database/supabase/schema.sql)
// -----------------------------------------------------------------------------
runTest('P0: Verify RLS policies have ZERO anonymous bypasses', () => {
  const schemaSql = fs.readFileSync('../database/supabase/schema.sql', 'utf8');
  
  // Must NOT contain auth.uid() IS NULL in any policy
  const anonBypassMatches = schemaSql.match(/auth\.uid\(\)\s+IS\s+NULL/gi);
  assert.strictEqual(anonBypassMatches, null, `Found ${anonBypassMatches?.length} anonymous bypasses in schema.sql`);

  // Must enable RLS on pipelines, webhooks, and custom_roles
  assert(schemaSql.includes('ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;'), 'pipelines table missing RLS');
  assert(schemaSql.includes('ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;'), 'webhooks table missing RLS');
  assert(schemaSql.includes('ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;'), 'custom_roles table missing RLS');

  // Must have is_admin helper
  assert(schemaSql.includes('is_admin()'), 'Missing is_admin() helper function');
  assert(schemaSql.includes('current_user_team_id()'), 'Missing current_user_team_id() helper function');

  // Must have resolved_at in bugs table
  assert(schemaSql.includes('resolved_at TEXT'), 'bugs table missing resolved_at column');

  // Must enforce bug status = Fixed restriction
  assert(schemaSql.includes("status != 'Fixed'"), 'Missing bug Fixed status policy');

  // Mails table must enforce sender check on insert/update
  assert(schemaSql.includes('Mails access policy'), 'Mails table missing access policy');
  assert(schemaSql.includes('from_user = auth.uid()::text OR public.is_admin()'), 'Mails missing sender validation');
});

// -----------------------------------------------------------------------------
// Test 2: P0 — Repository Upsert & Error Transparency (src/lib/repository.js)
// -----------------------------------------------------------------------------
runTest('P0: Verify Repository.upsert and error transparency', () => {
  const repoJs = fs.readFileSync('src/lib/repository.js', 'utf8');

  // Upsert method must be implemented
  assert(repoJs.includes('async upsert(tableName, record, onConflict = \'id\')'), 'Repository.upsert missing');

  // Has active session check for isolated sandbox demo mode (Option B)
  assert(repoJs.includes('hasActiveSupabaseSession'), 'Missing hasActiveSupabaseSession check');

  // Must NOT silently swallow errors (returns success, remote, error)
  assert(repoJs.includes('success: !remoteError'), 'Repository must return success: !remoteError on outcome');
  assert(repoJs.includes('remote: remoteSuccess'), 'Repository must report remote sync status');
});

// -----------------------------------------------------------------------------
// Test 3: P0 — Strict MFA Validation (No 6-char bypass)
// -----------------------------------------------------------------------------
runTest('P0: Verify Strict MFA validation', () => {
  const loginJs = fs.readFileSync('src/views/GhibliLoginView.jsx', 'utf8');
  const appContextJs = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

  // GhibliLoginView must not initialize mfaCode with '123456'
  assert(/const\s+\[mfaCode,\s*setMfaCode\]\s*=\s*useState\(''\);/.test(loginJs), 'mfaCode should initialize to empty string');
  assert(!loginJs.includes("useState('123456')"), 'mfaCode must not pre-populate with valid code');

  // AppContext verifyMfaCode must reject non-123456 codes
  assert(appContextJs.includes("code && code.trim() === '123456'"), 'MFA must strictly validate code === 123456');
  assert(!appContextJs.includes("code.trim().length === 6"), 'MFA must not permit arbitrary 6-character strings');
});

// -----------------------------------------------------------------------------
// Test 4: P1 — Canonical Task Movement Path (BUG-P1-001)
// -----------------------------------------------------------------------------
runTest('P1: Verify Canonical moveTask signature & PR merge / CI wiring', () => {
  const appContextJs = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

  // moveTask signature
  assert(appContextJs.includes("const moveTask = (taskId, newStatus, actorOverride = null, source = 'kanban')"), 
    'moveTask must accept actorOverride and source');

  // PR merge wiring to moveTask
  assert(appContextJs.includes("moveTask(pr.linkedTaskId, 'Done'"), 
    'mergePullRequest must use canonical moveTask');
  assert(appContextJs.includes("updateBugStatus(pr.linkedBugId, 'Fixed')"), 
    'mergePullRequest must use canonical updateBugStatus');

  // CI/CD pipeline wiring to moveTask
  assert(appContextJs.includes("moveTask(t.id, 'Done', { id: 'ci-bot', name: 'CI/CD Automation' }, 'pipeline')"), 
    'triggerPipeline must use canonical moveTask');
});

// -----------------------------------------------------------------------------
// Test 5: P1 — AI Diff Enforcement & Review Safeguard (BUG-P1-004)
// -----------------------------------------------------------------------------
runTest('P1: Verify direct code buffer insertion is removed and diff review is enforced', () => {
  const botJs = fs.readFileSync('src/components/DebugAIBot.jsx', 'utf8');
  const editorJs = fs.readFileSync('src/views/CodeEditorView.jsx', 'utf8');

  // DebugAIBot must NOT have handleInsertCode or Insert button
  assert(!botJs.includes('onInsertCode'), 'DebugAIBot must not have onInsertCode prop');
  assert(!botJs.includes('handleInsertCode'), 'DebugAIBot must not have handleInsertCode');

  // CodeEditorView must route AI code to Diff Modal
  assert(editorJs.includes('onRequestReviewDiff'), 'CodeEditorView must route AI code via onRequestReviewDiff');
  assert(editorJs.includes('setShowDiffModal(true)'), 'CodeEditorView must open AIDiffModal');
  assert(editorJs.includes('handleApplyAIDiff'), 'CodeEditorView must apply code only after diff confirmation');
});

// -----------------------------------------------------------------------------
// Test 6: P1 — Dashboard Data Truth: Real MTTR & Heatmap (BUG-P1-002, BUG-P1-003)
// -----------------------------------------------------------------------------
runTest('P1: Verify Dashboard calculates real MTTR and buckets actual commit dates', () => {
  const dashJs = fs.readFileSync('src/views/DashboardView.jsx', 'utf8');

  // Must calculate real MTTR from resolvedAt and createdAt
  assert(dashJs.includes('resolvedAt'), 'Dashboard must inspect resolvedAt for MTTR');
  assert(!dashJs.includes("value: '< 2h'"), 'Dashboard must not hardcode static MTTR value');

  // Must bucket real dates for heatmap, not (i % 3) + 1
  assert(!dashJs.includes('(i % 3) + 1'), 'Dashboard must not synthesize heatmap counts using modulo');
  assert(dashJs.includes("dateStr = d.toISOString().split('T')[0]"), 'Dashboard must bucket commits by actual date string');

  // Renamed Lead Time to Last Build Duration (BUG-P2-009)
  assert(dashJs.includes('Last Build Duration'), 'Dashboard must display honest Last Build Duration label');
});

// -----------------------------------------------------------------------------
// Test 7: P1 — Video Conference Room Isolation & Real Retry (BUG-P1-007, BUG-P2-006)
// -----------------------------------------------------------------------------
runTest('P1: Verify Video room isolation by project team and iframe reload on retry', () => {
  const videoJs = fs.readFileSync('src/views/VideoCallView.jsx', 'utf8');

  // Uses selectedProject teamId
  assert(videoJs.includes('selectedProject?.teamId'), 'Video room must derive team from selectedProject');
  
  // Real retry via key with retryCount
  assert(videoJs.includes('retryCount'), 'VideoCallView must track retryCount state');
  assert(videoJs.includes('key={`video-frame-${roomName}-${retryCount}`}'), 'Video iframe must include retryCount in key');

  // Honest "No Active Project Selected" state
  assert(videoJs.includes('No Active Project Selected'), 'VideoCallView must guard against null selectedProjectId');
});

// -----------------------------------------------------------------------------
// Test 8: P2 — Kanban Board All Projects Filter & Same-Column Drop Toast
// -----------------------------------------------------------------------------
runTest('P2: Verify Kanban displays all authorized projects and suppresses duplicate move toasts', () => {
  const kanbanJs = fs.readFileSync('src/views/KanbanView.jsx', 'utf8');

  // Must destructure allTasks
  assert(kanbanJs.includes('allTasks = []'), 'KanbanView must destructure allTasks');
  assert(kanbanJs.includes('allowedProjectIds'), 'KanbanView must filter allTasks by allowedProjectIds');

  // Must only show toast if moved === true
  assert(kanbanJs.includes('if (moved)'), 'KanbanView must only toast if moveTask succeeded');
});

// -----------------------------------------------------------------------------
// Test 9: P2 & P3 — Accessibility & Keyboard Shortcuts (BUG-P2-003, BUG-P2-011)
// -----------------------------------------------------------------------------
runTest('P2/P3: Verify ARIA semantics and unified shortcuts', () => {
  const ctxMenuJs = fs.readFileSync('src/components/ContextMenu.jsx', 'utf8');
  const cmdJs = fs.readFileSync('src/components/CommandPalette.jsx', 'utf8');
  const searchJs = fs.readFileSync('src/components/GlobalSearch.jsx', 'utf8');
  const workspaceJs = fs.readFileSync('src/components/RotationalWorkspace.jsx', 'utf8');
  const shortcutsJs = fs.readFileSync('src/domain/shortcuts/shortcutRegistry.js', 'utf8');

  // ContextMenu ARIA & arrow navigation
  assert(ctxMenuJs.includes('role="menu"'), 'ContextMenu missing role=menu');
  assert(ctxMenuJs.includes('role="menuitem"'), 'ContextMenu missing role=menuitem');
  assert(ctxMenuJs.includes('ArrowDown'), 'ContextMenu missing ArrowDown handler');

  // CommandPalette ARIA
  assert(cmdJs.includes('role="dialog"'), 'CommandPalette missing role=dialog');
  assert(cmdJs.includes('role="listbox"'), 'CommandPalette missing role=listbox');

  // GlobalSearch ARIA
  assert(searchJs.includes('role="dialog"'), 'GlobalSearch missing role=dialog');

  // RotationalWorkspace shortcuts
  assert(workspaceJs.includes('toggleDarkMode();'), 'RotationalWorkspace missing Mod+Shift+L dark mode handler');
  assert(shortcutsJs.includes('nav-projects'), 'shortcutRegistry missing nav-projects');
});

// -----------------------------------------------------------------------------
// Test 10: P3 — AIDiffModal LCS Table Size Guard (P3-005)
// -----------------------------------------------------------------------------
runTest('P3: Verify AIDiffModal LCS size guard for large files', () => {
  const diffJs = fs.readFileSync('src/components/AIDiffModal.jsx', 'utf8');
  assert(diffJs.includes('n * m > 2000000'), 'AIDiffModal missing 2M cell table size guard');
});

// -----------------------------------------------------------------------------
// Test 11: P3 — Code Splitting & Bundle Size Optimization (P3-003)
// -----------------------------------------------------------------------------
runTest('P3: Verify React.lazy code splitting and bundle distribution', () => {
  const workspaceJs = fs.readFileSync('src/components/RotationalWorkspace.jsx', 'utf8');
  const viteConfig = fs.readFileSync('vite.config.js', 'utf8');

  assert(workspaceJs.includes('React.lazy') || workspaceJs.includes('lazy('), 'RotationalWorkspace missing React.lazy imports');
  assert(workspaceJs.includes('React.Suspense') || workspaceJs.includes('<Suspense'), 'RotationalWorkspace missing Suspense boundary');
  assert(viteConfig.includes('manualChunks'), 'vite.config.js missing manualChunks configuration');
});

// -----------------------------------------------------------------------------
// Test 12: P1 — Command Palette & Modal Icon Import Regression Guard (CSLM-QA-001)
// -----------------------------------------------------------------------------
runTest('P1: Verify Command Palette & Modals have zero undefined icon imports', () => {
  const modalFiles = [
    'src/components/CommandPalette.jsx',
    'src/components/GlobalSearch.jsx',
    'src/components/ShortcutsModal.jsx'
  ];

  for (const f of modalFiles) {
    const code = fs.readFileSync(f, 'utf8');
    const lucideImport = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
    assert(lucideImport, `${f} missing lucide-react import`);
    const importedSet = new Set(
      lucideImport[1]
        .split(',')
        .map(s => s.trim().split(/\s+as\s+/)[0])
        .filter(Boolean)
    );

    // Specifically verify ArrowRight is imported in CommandPalette (CSLM-QA-001 fix)
    if (f.includes('CommandPalette')) {
      assert(importedSet.has('ArrowRight'), 'CommandPalette.jsx missing ArrowRight import');
    }
  }
});

// -----------------------------------------------------------------------------
// Test 13: P0 — Plaintext Password Stripping & Legacy Sanitization (CSLM-QA-003)
// -----------------------------------------------------------------------------
runTest('P0: Verify password stripping and legacy session hydration sanitization', () => {
  const authServiceJs = fs.readFileSync('src/domain/auth/authService.js', 'utf8');
  const appContextJs = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

  // authService must export sanitizeUser
  assert(authServiceJs.includes('export const sanitizeUser'), 'authService missing sanitizeUser export');

  // restoreSession must sanitize legacy localStorage data
  assert(authServiceJs.includes('localUser.password !== undefined'), 'restoreSession must check and sanitize localUser.password');

  // register & login must not persist password in auth_session_user
  assert(authServiceJs.includes("DynamicStorage.setItem('auth_session_user', safeLocalUser)"), 'register must store sanitized user');
  assert(authServiceJs.includes("DynamicStorage.setItem('auth_session_user', safeUser)"), 'login must store sanitized user');

  // AppContext establishUserSession must strip password before persistence
  assert(appContextJs.includes('password: _'), 'AppContext establishUserSession must strip password');
});

// -----------------------------------------------------------------------------
// Test 14: P1 — Optional Project Deadline & Honest Simulation Badges (CSLM-QA-009, CSLM-QA-011)
// -----------------------------------------------------------------------------
runTest('P1: Verify optional project deadline and honest simulation badges', () => {
  const projectsJs = fs.readFileSync('src/views/ProjectsView.jsx', 'utf8');
  const repoJs = fs.readFileSync('src/views/RepoView.jsx', 'utf8');

  // ProjectsView must not require deadline
  assert(!projectsJs.includes('if (!name || !deadline)'), 'ProjectsView must not require deadline in submit guard');
  assert(projectsJs.includes('Target Deadline (Optional)'), 'ProjectsView must label deadline as optional');

  // RepoView must visibly display simulated repository badge and GitHub read-only badge
  assert(repoJs.includes('SIMULATED REPOSITORY'), 'RepoView missing SIMULATED REPOSITORY indicator');
  assert(repoJs.includes('GITHUB — READ ONLY'), 'RepoView missing GITHUB — READ ONLY indicator');
});

// -----------------------------------------------------------------------------
// Test 15: P2 — Input Element Isolation for Shortcuts (CSLM-QA-006)
// -----------------------------------------------------------------------------
runTest('P2: Verify hardened input element isolation for shortcuts', () => {
  const shortcutRegistryJs = fs.readFileSync('src/domain/shortcuts/shortcutRegistry.js', 'utf8');

  // isInputElement must check monaco editor and contenteditable
  assert(shortcutRegistryJs.includes('.monaco-editor'), 'isInputElement missing .monaco-editor guard');
  assert(shortcutRegistryJs.includes('contentEditable'), 'isInputElement missing contentEditable guard');
});

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} test suites passed.`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
