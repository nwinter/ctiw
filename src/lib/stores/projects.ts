/**
 * CTIW Project Store
 *
 * Manages saving and loading projects to/from localStorage.
 * Uses Svelte 5 runes for reactivity.
 */

/** Project structure */
export interface Project {
	id: string;
	name: string;
	code: string;
	createdAt: Date;
	updatedAt: Date;
	thumbnail?: string; // Base64 screenshot (for future use)
}

/** Serialized project for localStorage (dates as strings) */
interface SerializedProject {
	id: string;
	name: string;
	code: string;
	createdAt: string;
	updatedAt: string;
	thumbnail?: string;
}

const STORAGE_KEY = 'ctiw-projects';
const isBrowser = typeof window !== 'undefined';

/** Default starter projects */
const DEFAULT_PROJECTS: Project[] = [
	{
		id: 'starter-hello-world',
		name: 'Hello World',
		code: `=CTIW=
=title=Hello World!=

=text=Welcome to CTIW!=
=text=This is my first page.=
==CTIW==`,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01')
	},
	{
		id: 'starter-my-first-page',
		name: 'My First Page',
		code: `=CTIW=
=title=My Awesome Page=

=text=Hi! I made this page with CTIW!=

=divide= id:box= color=ADD8E6=
.. =text=This is inside a blue box!=
.. =button=Click Me!=
=divide=

=text=Thanks for visiting!=
==CTIW==`,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01')
	},
	{
		id: 'starter-colorful-page',
		name: 'Colorful Page',
		code: `=CTIW=
=title=My Colorful Page=

=divide= id:red= color=FF6B6B=
.. =text=This box is red!=
=divide=

=divide= id:green= color=4ECDC4=
.. =text=This box is green!=
=divide=

=divide= id:blue= color=45B7D1=
.. =text=This box is blue!=
=divide=

=(time)=
==CTIW==`,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01')
	}
];

/** Serialize a project for localStorage */
function serializeProject(project: Project): SerializedProject {
	return {
		...project,
		createdAt: project.createdAt.toISOString(),
		updatedAt: project.updatedAt.toISOString()
	};
}

/** Deserialize a project from localStorage */
function deserializeProject(data: SerializedProject): Project {
	return {
		...data,
		createdAt: new Date(data.createdAt),
		updatedAt: new Date(data.updatedAt)
	};
}

/** Load projects from localStorage */
function loadProjects(): Project[] {
	if (!isBrowser) return [];

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) {
			// Initialize with default projects
			saveProjectsToStorage(DEFAULT_PROJECTS);
			return [...DEFAULT_PROJECTS];
		}
		const parsed: SerializedProject[] = JSON.parse(saved);
		return parsed.map(deserializeProject);
	} catch (error) {
		console.error('Failed to load projects from localStorage:', error);
		return [...DEFAULT_PROJECTS];
	}
}

/** Save projects to localStorage */
function saveProjectsToStorage(projects: Project[]): void {
	if (!isBrowser) return;

	try {
		const serialized = projects.map(serializeProject);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
	} catch (error) {
		console.error('Failed to save projects to localStorage:', error);
	}
}

/** Generate a unique ID */
function generateId(): string {
	return `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Projects Store
 *
 * A reactive store for managing CTIW projects with localStorage persistence.
 */
class ProjectsStore {
	private _projects: Project[] = $state([]);

	constructor() {
		// Load from localStorage on initialization (client-side only)
		if (isBrowser) {
			this._projects = loadProjects();
		}
	}

	/** Get all projects, sorted by last updated */
	get projects(): Project[] {
		return [...this._projects].sort(
			(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
		);
	}

	/** Create a new project */
	createProject(name: string, code: string): Project {
		const project: Project = {
			id: generateId(),
			name,
			code,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		this._projects = [...this._projects, project];
		saveProjectsToStorage(this._projects);
		return project;
	}

	/** Update an existing project */
	updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): void {
		const index = this._projects.findIndex((p) => p.id === id);
		if (index === -1) {
			console.warn(`Project with id "${id}" not found`);
			return;
		}

		const updatedProject = {
			...this._projects[index],
			...updates,
			updatedAt: new Date()
		};

		this._projects = [
			...this._projects.slice(0, index),
			updatedProject,
			...this._projects.slice(index + 1)
		];
		saveProjectsToStorage(this._projects);
	}

	/** Delete a project */
	deleteProject(id: string): void {
		// Don't allow deleting starter projects
		if (id.startsWith('starter-')) {
			console.warn('Cannot delete starter projects');
			return;
		}

		this._projects = this._projects.filter((p) => p.id !== id);
		saveProjectsToStorage(this._projects);
	}

	/** Get a single project by ID */
	getProject(id: string): Project | undefined {
		return this._projects.find((p) => p.id === id);
	}

	/** List all projects (alias for projects getter) */
	listProjects(): Project[] {
		return this.projects;
	}

	/** Search projects by name */
	searchProjects(query: string): Project[] {
		if (!query.trim()) return this.projects;

		const lowerQuery = query.toLowerCase();
		return this.projects.filter((p) =>
			p.name.toLowerCase().includes(lowerQuery)
		);
	}

	/** Check if a project exists */
	hasProject(id: string): boolean {
		return this._projects.some((p) => p.id === id);
	}

	/** Duplicate a project */
	duplicateProject(id: string): Project | undefined {
		const original = this.getProject(id);
		if (!original) return undefined;

		return this.createProject(`${original.name} (Copy)`, original.code);
	}
}

/** Singleton instance of the projects store */
export const projectsStore = new ProjectsStore();
