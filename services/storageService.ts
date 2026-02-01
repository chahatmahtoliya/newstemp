/**
 * Storage Service - localStorage Project Management
 * Save, load, and manage projects locally
 */
import { NewsData, StyleSettings, MultiImageSettings, defaultStyleSettings, defaultMultiImageSettings } from '../types';
import { TemplateType } from './templateService';

export interface SavedProject {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    template: TemplateType;
    presetId: string;
    bannerText: string;
    headline: string;
    description: string;
    styleSettings: StyleSettings;
    multiImageSettings: MultiImageSettings;
    backgroundImage: string | null;
    logoImage: string | null;
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    logoSize: number;
}

const STORAGE_KEY = 'newsflash_projects';
const RECENT_STYLES_KEY = 'newsflash_recent_styles';
const MAX_PROJECTS = 20;
const MAX_RECENT_STYLES = 5;

/**
 * Generate unique ID
 */
function generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved projects
 */
export function getProjects(): SavedProject[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const projects = JSON.parse(data) as SavedProject[];
        // Sort by updatedAt (most recent first)
        return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
        return [];
    }
}

/**
 * Save a new project
 */
export function saveProject(project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): SavedProject {
    const projects = getProjects();

    const newProject: SavedProject = {
        ...project,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    // Keep only MAX_PROJECTS
    const updatedProjects = [newProject, ...projects].slice(0, MAX_PROJECTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    return newProject;
}

/**
 * Update existing project
 */
export function updateProject(id: string, updates: Partial<SavedProject>): SavedProject | null {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) return null;

    projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
}

/**
 * Delete a project
 */
export function deleteProject(id: string): boolean {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id);

    if (filtered.length === projects.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Get a single project by ID
 */
export function getProject(id: string): SavedProject | null {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
}

/**
 * Duplicate a project
 */
export function duplicateProject(id: string): SavedProject | null {
    const project = getProject(id);
    if (!project) return null;

    const { id: _, createdAt: __, updatedAt: ___, ...rest } = project;
    return saveProject({
        ...rest,
        name: `${rest.name} (Copy)`
    });
}

/**
 * Save recent style settings
 */
export function saveRecentStyle(style: StyleSettings): void {
    try {
        const data = localStorage.getItem(RECENT_STYLES_KEY);
        let styles: StyleSettings[] = data ? JSON.parse(data) : [];

        // Remove duplicate if exists
        styles = styles.filter(s =>
            s.headlineColor !== style.headlineColor ||
            s.bannerColor !== style.bannerColor ||
            s.headlineFont !== style.headlineFont
        );

        // Add to front
        styles.unshift(style);

        // Keep only MAX_RECENT_STYLES
        styles = styles.slice(0, MAX_RECENT_STYLES);

        localStorage.setItem(RECENT_STYLES_KEY, JSON.stringify(styles));
    } catch {
        // Ignore storage errors
    }
}

/**
 * Get recent styles
 */
export function getRecentStyles(): StyleSettings[] {
    try {
        const data = localStorage.getItem(RECENT_STYLES_KEY);
        if (!data) return [];
        return JSON.parse(data) as StyleSettings[];
    } catch {
        return [];
    }
}

/**
 * Clear all projects (use with caution)
 */
export function clearAllProjects(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; projectCount: number } {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    return {
        used: new Blob([data]).size,
        projectCount: getProjects().length
    };
}

/**
 * Auto-save draft (overwrites previous draft)
 */
const DRAFT_KEY = 'newsflash_draft';

export function saveDraft(data: Partial<SavedProject>): void {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
        ...data,
        updatedAt: Date.now()
    }));
}

export function getDraft(): Partial<SavedProject> | null {
    try {
        const data = localStorage.getItem(DRAFT_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
}
