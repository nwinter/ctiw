<script lang="ts">
	import { projectsStore, type Project } from '$lib/stores/projects';

	interface Props {
		onLoadProject: (project: Project) => void;
		onNewProject: () => void;
	}

	let { onLoadProject, onNewProject }: Props = $props();

	let searchQuery = $state('');
	let showDeleteConfirm = $state<string | null>(null);

	// Get filtered projects based on search
	let filteredProjects = $derived(
		searchQuery.trim()
			? projectsStore.searchProjects(searchQuery)
			: projectsStore.projects
	);

	function handleLoadProject(project: Project) {
		onLoadProject(project);
	}

	function handleDeleteClick(projectId: string, event: MouseEvent) {
		event.stopPropagation();
		showDeleteConfirm = projectId;
	}

	function handleConfirmDelete(projectId: string) {
		projectsStore.deleteProject(projectId);
		showDeleteConfirm = null;
	}

	function handleCancelDelete() {
		showDeleteConfirm = null;
	}

	function formatDate(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return 'Today';
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else {
			return date.toLocaleDateString();
		}
	}

	function getPreviewLines(code: string): string[] {
		return code.split('\n').slice(0, 4);
	}

	function isStarterProject(id: string): boolean {
		return id.startsWith('starter-');
	}
</script>

<div class="gallery">
	<!-- Header with search and new project button -->
	<div class="gallery-header">
		<h2 class="gallery-title">My Projects</h2>
		<div class="gallery-actions">
			<div class="search-box">
				<svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					placeholder="Search projects..."
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>
			<button class="new-project-btn" onclick={onNewProject}>
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Project
			</button>
		</div>
	</div>

	<!-- Projects grid -->
	<div class="projects-grid">
		{#each filteredProjects as project (project.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="project-card"
				onclick={() => handleLoadProject(project)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && handleLoadProject(project)}
			>
				<!-- Preview area -->
				<div class="project-preview">
					<div class="preview-code">
						{#each getPreviewLines(project.code) as line}
							<div class="preview-line">{line || '\u00A0'}</div>
						{/each}
						{#if project.code.split('\n').length > 4}
							<div class="preview-more">...</div>
						{/if}
					</div>
					{#if isStarterProject(project.id)}
						<span class="starter-badge">Starter</span>
					{/if}
				</div>

				<!-- Project info -->
				<div class="project-info">
					<h3 class="project-name">{project.name}</h3>
					<p class="project-date">Updated {formatDate(project.updatedAt)}</p>
				</div>

				<!-- Delete button (not for starter projects) -->
				{#if !isStarterProject(project.id)}
					<button
						class="delete-btn"
						onclick={(e) => handleDeleteClick(project.id, e)}
						type="button"
						aria-label="Delete project"
					>
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				{/if}

				<!-- Delete confirmation overlay -->
				{#if showDeleteConfirm === project.id}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="delete-confirm-overlay"
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => e.key === 'Escape' && handleCancelDelete()}
						role="dialog"
						tabindex="-1"
						aria-modal="true"
						aria-label="Confirm delete"
					>
						<p>Delete this project?</p>
						<div class="confirm-buttons">
							<button
								class="confirm-yes"
								onclick={(e) => { e.stopPropagation(); handleConfirmDelete(project.id); }}
								type="button"
							>
								Yes, delete
							</button>
							<button
								class="confirm-no"
								onclick={(e) => { e.stopPropagation(); handleCancelDelete(); }}
								type="button"
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Empty state -->
	{#if filteredProjects.length === 0}
		<div class="empty-state">
			{#if searchQuery.trim()}
				<p>No projects found matching "{searchQuery}"</p>
				<button class="clear-search" onclick={() => searchQuery = ''}>
					Clear search
				</button>
			{:else}
				<p>No projects yet! Create your first one.</p>
				<button class="new-project-btn" onclick={onNewProject}>
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Create Project
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.gallery {
		width: 100%;
	}

	.gallery-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.gallery-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #7c3aed;
		margin: 0;
	}

	.gallery-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
		pointer-events: none;
	}

	.search-input {
		padding: 0.625rem 1rem 0.625rem 2.5rem;
		border: 2px solid #e5e7eb;
		border-radius: 9999px;
		font-size: 0.875rem;
		width: 200px;
		transition: all 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: #8b5cf6;
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
	}

	.new-project-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #8b5cf6, #6366f1);
		color: white;
		border: none;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.new-project-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
	}

	.new-project-btn svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1.25rem;
	}

	.project-card {
		position: relative;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 1rem;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		padding: 0;
		width: 100%;
	}

	.project-card:hover {
		border-color: #8b5cf6;
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
	}

	.project-preview {
		position: relative;
		background: linear-gradient(135deg, #1e1b4b, #312e81);
		padding: 1rem;
		min-height: 100px;
	}

	.preview-code {
		font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 0.625rem;
		line-height: 1.4;
		color: #a5b4fc;
	}

	.preview-line {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.preview-more {
		color: #6366f1;
		margin-top: 0.25rem;
	}

	.starter-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		color: #1e1b4b;
		font-size: 0.625rem;
		font-weight: 700;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.project-info {
		padding: 1rem;
	}

	.project-name {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.project-date {
		font-size: 0.75rem;
		color: #9ca3af;
		margin: 0;
	}

	.delete-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s;
	}

	.project-card:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
	}

	.delete-btn svg {
		width: 1rem;
		height: 1rem;
	}

	.delete-confirm-overlay {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.95);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;
		border-radius: 1rem;
		backdrop-filter: blur(4px);
	}

	.delete-confirm-overlay p {
		font-weight: 600;
		color: #1f2937;
		margin: 0;
		text-align: center;
	}

	.confirm-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.confirm-yes {
		padding: 0.5rem 1rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-yes:hover {
		background: #dc2626;
	}

	.confirm-no {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.confirm-no:hover {
		background: #e5e7eb;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #6b7280;
	}

	.empty-state p {
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.clear-search {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-search:hover {
		background: #e5e7eb;
	}
</style>
