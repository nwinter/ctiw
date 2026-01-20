<script lang="ts">
	import { browser } from '$app/environment';
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import AIAssistant from '$lib/components/AIAssistant.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import SyntaxLegend from '$lib/components/SyntaxLegend.svelte';
	import { parse } from '$lib/parser/parser';
	import { generateHTML } from '$lib/parser/codegen';
	import { projectsStore, type Project } from '$lib/stores/projects.svelte';

	// View modes
	let showGallery = $state(true);
	let currentProject = $state<Project | null>(null);
	let showShareModal = $state(false);
	let shareUrl = $state('');
	let copySuccess = $state(false);
	let aiHelperCollapsed = $state(false);

	// Default CTIW example code for kids to explore
	const DEFAULT_CODE = `=CTIW=
=title=My Awesome Page=

=text=Hi! I made this page with CTIW!=

=divide= id:funbox= color=ADD8E6=
.. =text=This is inside a blue box!=
.. =button=Click Me!=
=divide=

=text=Thanks for visiting!=
=(time)=
==CTIW==`;

	let code = $state(DEFAULT_CODE);

	// Parse result derived from code (no mutations inside derived!)
	let parseResult = $derived.by(() => {
		try {
			return { result: parse(code), error: null };
		} catch (err) {
			return { result: null, error: err instanceof Error ? err.message : 'Unknown error' };
		}
	});

	// Errors derived from parse result
	let parseErrors = $derived.by(() => {
		if (parseResult.error) {
			return [`Error: ${parseResult.error}`];
		}
		if (parseResult.result && parseResult.result.errors.length > 0) {
			return parseResult.result.errors.map(e => `Line ${e.line}: ${e.message}`);
		}
		return [];
	});

	// Generate HTML from CTIW code
	let generatedHTML = $derived.by(() => {
		if (parseResult.error || !parseResult.result) {
			return `<!DOCTYPE html>
<html>
<head><title>Preview</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <p style="color: #ff6b6b;">Oops! There's an error in your code.</p>
</body>
</html>`;
		}
		return generateHTML(parseResult.result.document);
	});

	// Handle inserting code from AI assistant
	// Smart insertion: if it's a full document, replace; if it's a snippet, append before ==CTIW==
	function handleInsertCode(newCode: string) {
		const isFullDocument = newCode.trim().startsWith('=CTIW=');

		let resultCode: string;
		if (isFullDocument) {
			// Full document - replace everything
			resultCode = newCode;
		} else {
			// Snippet - insert before ==CTIW==
			const trimmedCode = code.trim();
			const closerIndex = trimmedCode.lastIndexOf('==CTIW==');

			if (closerIndex !== -1) {
				// Insert before the closing ==CTIW==
				const beforeCloser = trimmedCode.slice(0, closerIndex).trimEnd();
				resultCode = beforeCloser + '\n\n' + newCode.trim() + '\n==CTIW==';
			} else {
				// No closer found - just append
				resultCode = code + '\n' + newCode;
			}
		}

		code = resultCode;
		// Auto-save if we have a project
		if (currentProject) {
			projectsStore.updateProject(currentProject.id, { code: resultCode });
		}
	}

	// Handle loading a project from gallery
	function handleLoadProject(project: Project, pushState = true) {
		currentProject = project;
		code = project.code;
		showGallery = false;
		if (pushState && browser) {
			history.pushState({ view: 'project', projectId: project.id }, '', `?project=${project.id}`);
		}
	}

	// Handle creating a new project
	function handleNewProject(pushState = true) {
		currentProject = null;
		code = DEFAULT_CODE;
		showGallery = false;
		if (pushState && browser) {
			history.pushState({ view: 'editor' }, '', '?new');
		}
	}

	// Go back to gallery
	function handleBackToGallery(pushState = true) {
		// Save current project before going back
		if (currentProject) {
			projectsStore.updateProject(currentProject.id, { code });
		}
		showGallery = true;
		currentProject = null;
		if (pushState && browser) {
			history.pushState({ view: 'gallery' }, '', window.location.pathname);
		}
	}

	// Save project (creates new if none exists)
	function handleSaveProject() {
		if (currentProject) {
			projectsStore.updateProject(currentProject.id, { code });
		} else {
			// Get title from code or use default
			const result = parse(code);
			const title = result.document.metadata.title || 'My New Project';
			const newProject = projectsStore.createProject(title, code);
			currentProject = newProject;
			// Update URL to reflect the saved project
			if (browser) {
				history.replaceState({ view: 'project', projectId: newProject.id }, '', `?project=${newProject.id}`);
			}
		}
	}

	// Auto-save on code change (debounced)
	let saveTimeout: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (currentProject && code !== currentProject.code) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				projectsStore.updateProject(currentProject!.id, { code });
			}, 1000);
		}
		return () => clearTimeout(saveTimeout);
	});

	// URL state management - handle initial load and popstate
	$effect(() => {
		if (browser) {
			// Handle initial URL on page load
			handleUrlState();

			// Listen for back/forward navigation
			const handlePopState = (event: PopStateEvent) => {
				if (event.state?.view === 'gallery') {
					showGallery = true;
					currentProject = null;
				} else if (event.state?.view === 'project' && event.state.projectId) {
					const project = projectsStore.projects.find(p => p.id === event.state.projectId);
					if (project) {
						handleLoadProject(project, false);
					} else {
						// Project not found, go to gallery
						showGallery = true;
						currentProject = null;
					}
				} else if (event.state?.view === 'editor') {
					handleNewProject(false);
				} else {
					// Check URL params as fallback
					handleUrlState();
				}
			};

			window.addEventListener('popstate', handlePopState);
			return () => window.removeEventListener('popstate', handlePopState);
		}
	});

	// Parse URL and set initial state
	function handleUrlState() {
		const params = new URLSearchParams(window.location.search);
		const hash = window.location.hash.slice(1);

		// Check for shared code in hash (base64 encoded)
		if (hash) {
			try {
				const base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
				const decoded = atob(base64);
				if (decoded.includes('=CTIW=')) {
					code = decoded;
					showGallery = false;
					currentProject = null;
					// Replace hash URL with clean URL
					history.replaceState({ view: 'editor' }, '', '?new');
					return;
				}
			} catch {
				// Invalid base64 - ignore
			}
		}

		// Check for project ID in query params
		const projectId = params.get('project');
		if (projectId) {
			const project = projectsStore.projects.find(p => p.id === projectId);
			if (project) {
				currentProject = project;
				code = project.code;
				showGallery = false;
				history.replaceState({ view: 'project', projectId: project.id }, '', `?project=${project.id}`);
				return;
			}
		}

		// Check for new editor
		if (params.has('new')) {
			showGallery = false;
			currentProject = null;
			code = DEFAULT_CODE;
			history.replaceState({ view: 'editor' }, '', '?new');
			return;
		}

		// Default to gallery
		showGallery = true;
		history.replaceState({ view: 'gallery' }, '', window.location.pathname);
	}

	// Generate shareable URL
	function handleShare() {
		// Encode code as URL-safe base64
		const base64 = btoa(code);
		const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		shareUrl = `${window.location.origin}${window.location.pathname}#${urlSafe}`;
		showShareModal = true;
		copySuccess = false;
	}

	// Copy URL to clipboard
	async function copyShareUrl() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copySuccess = true;
			setTimeout(() => copySuccess = false, 2000);
		} catch {
			// Fallback for older browsers
			const input = document.createElement('input');
			input.value = shareUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			copySuccess = true;
			setTimeout(() => copySuccess = false, 2000);
		}
	}
</script>

<div class="h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
	<!-- Header -->
	<header class="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
					CTIW
				</h1>
				<span class="text-sm text-gray-500 hidden sm:inline">Clark's Text for Instructing Webpages</span>
			</div>

			{#if !showGallery}
				<div class="flex items-center gap-2">
					<button
						onclick={() => handleBackToGallery()}
						class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
					>
						← My Projects
					</button>
					<button
						onclick={handleShare}
						class="px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
					>
						🔗 Share
					</button>
					<button
						onclick={handleSaveProject}
						class="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
					>
						💾 Save
					</button>
				</div>
			{/if}
		</div>
	</header>

	<main class="flex-1 max-w-7xl mx-auto p-4 w-full min-h-0">
		{#if showGallery}
			<!-- Gallery View -->
			<div class="bg-white rounded-2xl shadow-xl p-6 mb-6 max-h-full overflow-auto">
				<Gallery onLoadProject={handleLoadProject} onNewProject={handleNewProject} />
			</div>
		{:else}
			<!-- Editor View - Responsive layout with fixed AI helper width -->
			<div class="flex gap-4 h-full">
				<!-- Code & Preview Container - Takes remaining space -->
				<div class="flex-1 flex gap-4 min-w-0">
					<!-- Editor Panel -->
					<div class="flex-1 flex flex-col min-h-0 min-w-0">
						<div class="flex items-center justify-between mb-2">
							<h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
								<span class="text-xl">✏️</span> Code
							</h2>
							{#if currentProject}
								<span class="text-sm text-gray-500 truncate ml-2">{currentProject.name}</span>
							{/if}
						</div>
						<div class="flex-1 min-h-0 rounded-xl overflow-hidden shadow-lg bg-[#1a1b26]">
							<Editor bind:code />
						</div>

						<!-- Parse Errors -->
						{#if parseErrors.length > 0}
							<div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex-shrink-0">
								<h3 class="text-sm font-semibold text-red-700 mb-1">Oops! Check your code:</h3>
								<ul class="text-sm text-red-600 space-y-1">
									{#each parseErrors as error}
										<li>• {error}</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Syntax Reference -->
						<div class="mt-2 flex-shrink-0">
							<SyntaxLegend />
						</div>
					</div>

					<!-- Preview Panel -->
					<div class="flex-1 flex flex-col min-h-0 min-w-0">
						<h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
							<span class="text-xl">👀</span> Preview
						</h2>
						<div class="flex-1 min-h-0 bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
							<Preview html={generatedHTML} />
						</div>
					</div>
				</div>

				<!-- AI Assistant Panel - Fixed width, collapses to narrow strip -->
				<div class="flex flex-col min-h-0 transition-all duration-300" style="width: {aiHelperCollapsed ? '60px' : '380px'}; flex-shrink: 0;">
					{#if !aiHelperCollapsed}
						<h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
							<span class="text-xl">🤖</span> AI Helper
						</h2>
					{/if}
					<div class="flex-1 min-h-0 rounded-xl overflow-hidden shadow-lg">
						<AIAssistant currentCode={code} onInsertCode={handleInsertCode} onCollapsedChange={(collapsed) => aiHelperCollapsed = collapsed} />
					</div>
				</div>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="py-2 text-center text-sm text-gray-500 flex-shrink-0">
		Made with 💜 for Clark
	</footer>

	<!-- Share Modal -->
	{#if showShareModal}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onclick={() => showShareModal = false}
		>
			<div
				class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.key === 'Escape' && (showShareModal = false)}
				role="dialog"
				aria-modal="true"
				aria-labelledby="share-title"
				tabindex="-1"
			>
				<h3 id="share-title" class="text-xl font-bold text-gray-800 mb-2">Share Your Creation!</h3>
				<p class="text-gray-600 text-sm mb-4">
					Copy this link to share your CTIW page with friends:
				</p>
				<div class="flex gap-2 mb-4">
					<input
						type="text"
						readonly
						value={shareUrl}
						class="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono truncate"
					/>
					<button
						onclick={copyShareUrl}
						class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-semibold whitespace-nowrap"
					>
						{copySuccess ? '✓ Copied!' : 'Copy'}
					</button>
				</div>
				<button
					onclick={() => showShareModal = false}
					class="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</div>
