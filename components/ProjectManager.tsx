import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Clock, Copy } from 'lucide-react';
import { SavedProject, getProjects, deleteProject, duplicateProject } from '../services/storageService';

interface ProjectManagerProps {
    onSave: () => void;
    onLoad: (project: SavedProject) => void;
    hasUnsavedChanges?: boolean;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    onSave,
    onLoad,
    hasUnsavedChanges
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [showProjects, setShowProjects] = useState(false);

    useEffect(() => {
        if (showProjects) {
            setProjects(getProjects());
        }
    }, [showProjects]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this project?')) {
            deleteProject(id);
            setProjects(getProjects());
        }
    };

    const handleDuplicate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        duplicateProject(id);
        setProjects(getProjects());
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-news-red" />
                    <span className="text-sm font-bold uppercase tracking-wider">Projects</span>
                    {hasUnsavedChanges && (
                        <span className="text-xs text-yellow-500">● Unsaved</span>
                    )}
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-800">
                    {/* Save Button */}
                    <button
                        onClick={onSave}
                        className="w-full mb-3 px-4 py-2 bg-news-red hover:bg-red-700 text-white rounded flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium">Save Project</span>
                    </button>

                    {/* Load Projects Toggle */}
                    <button
                        onClick={() => setShowProjects(!showProjects)}
                        className="w-full mb-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center space-x-2 transition-colors"
                    >
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-sm">
                            {showProjects ? 'Hide Projects' : 'Load Project'}
                        </span>
                    </button>

                    {/* Project List */}
                    {showProjects && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {projects.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-4">
                                    No saved projects yet
                                </p>
                            ) : (
                                projects.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => onLoad(project)}
                                        className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded cursor-pointer border border-gray-700 hover:border-gray-600 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate">
                                                    {project.name || project.headline || 'Untitled'}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {project.headline}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-600 mt-1">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatDate(project.updatedAt)}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleDuplicate(project.id, e)}
                                                    className="p-1 text-gray-500 hover:text-blue-400"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(project.id, e)}
                                                    className="p-1 text-gray-500 hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Storage info */}
                    {showProjects && projects.length > 0 && (
                        <p className="text-xs text-gray-600 text-center mt-2">
                            {projects.length} project{projects.length !== 1 ? 's' : ''} saved
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectManager;
