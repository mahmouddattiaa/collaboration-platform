import { useState, useCallback } from 'react';
import { Project } from '@/types/project';
import { Room } from '@/types/room';
import { projectService } from '@/services/projectService';
import { useAuth } from './useAuth';

export function useProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProjectsForUser = useCallback(async (rooms: Room[]) => {
    if (!token || !rooms || rooms.length === 0) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allProjects: Project[] = [];
      for (const room of rooms) {
        try {
          // The backend returns { success: boolean, data: Project[] }
          const response = await projectService.getProjects(room._id);
          if (response && response.data) {
            allProjects.push(...response.data);
          }
        } catch (err) {
          console.error(`Failed to fetch projects for room ${room._id}`, err);
          // Decide if you want to set a partial error message
        }
      }
      setProjects(allProjects);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    projects,
    isLoading,
    error,
    getProjectsForUser,
  };
}
