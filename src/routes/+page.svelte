<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import AIAssistant from '$lib/components/AIAssistant.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { parse } from '$lib/parser/parser';
	import { generateHTML } from '$lib/parser/codegen';
	import { projectsStore, type Project } from '$lib/stores/projects';

	// View modes
	let showGallery = $state(true);
	let currentProject = $state<Project | null>(null);

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
	let parseErrors = $state<string[]>([]);

	// Generate HTML from CTIW code
	let generatedHTML = $derived.by(() => {
		try {
			const result = parse(code);
			if (result.errors.length > 0) {
				parseErrors = result.errors.map(e => `Line ${e.line}: ${e.message}`);
			} else {
				parseErrors = [];
			}
			return generateHTML(result.document);
		} catch (err) {
			parseErrors = [`Error: ${err instanceof Error ? err.message : 'Unknown error'}`];
			return `<!DOCTYPE html>
<html>
<head><title>Preview</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <p style="color: #ff6b6b;">Oops! There's an error in your code.</p>
</body>
</html>`;
		}
	});

	// Handle inserting code from AI assistant
	function handleInsertCode(newCode: string) {
		code = newCode;
		// Auto-save if we have a project
		if (currentProject) {
			projectsStore.updateProject(currentProject.id, { code: newCode });
		}
	}

	// Handle loading a project from gallery
	function handleLoadProject(project: Project) {
		currentProject = project;
		code = project.code;
		showGallery = false;
	}

	// Handle creating a new project
	function handleNewProject() {
		currentProject = null;
		code = DEFAULT_CODE;
		showGallery = false;
	}

	// Go back to gallery
	function handleBackToGallery() {
		// Save current project before going back
		if (currentProject) {
			projectsStore.updateProject(currentProject.id, { code });
		}
		showGallery = true;
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
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
	<!-- Header -->
	<header class="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
					CTIW
				</h1>
				<span class="text-sm text-gray-500 hidden sm:inline">Clark's Totally Incredible Website</span>
			</div>

			{#if !showGallery}
				<div class="flex items-center gap-2">
					<button
						onclick={handleBackToGallery}
						class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
					>
						← My Projects
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

	<main class="max-w-7xl mx-auto p-4">
		{#if showGallery}
			<!-- Gallery View -->
			<div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
				<Gallery onLoadProject={handleLoadProject} onNewProject={handleNewProject} />
			</div>
		{:else}
			<!-- Editor View -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<!-- Editor Panel -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
							<span class="text-2xl">✏️</span> Code
						</h2>
						{#if currentProject}
							<span class="text-sm text-gray-500">{currentProject.name}</span>
						{/if}
					</div>
					<div class="rounded-xl overflow-hidden shadow-lg bg-[#1a1b26]" style="height: 500px;">
						<Editor bind:code />
					</div>

					<!-- Parse Errors -->
					{#if parseErrors.length > 0}
						<div class="bg-red-50 border border-red-200 rounded-lg p-3">
							<h3 class="text-sm font-semibold text-red-700 mb-1">Oops! Check your code:</h3>
							<ul class="text-sm text-red-600 space-y-1">
								{#each parseErrors as error}
									<li>• {error}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<!-- Preview Panel -->
				<div class="space-y-3">
					<h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
						<span class="text-2xl">👀</span> Preview
					</h2>
					<div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg" style="height: 500px;">
						<Preview html={generatedHTML} />
					</div>
				</div>

				<!-- AI Assistant Panel -->
				<div class="space-y-3">
					<h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
						<span class="text-2xl">🤖</span> AI Helper
					</h2>
					<div class="rounded-xl overflow-hidden shadow-lg" style="height: 500px;">
						<AIAssistant currentCode={code} onInsertCode={handleInsertCode} />
					</div>
				</div>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="mt-8 pb-4 text-center text-sm text-gray-500">
		Made with 💜 for Clark
	</footer>
</div>
