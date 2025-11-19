import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const projectService = {
  // Get all projects for a room
  getProjects: async (roomId: string) => {
    const response = await api.get(`${API_ENDPOINTS.GET_PROJECTS}/${roomId}`);
    return response.data;
  },

  // Get single project
  getProject: async (projectId: string) => {
    const response = await api.get(`${API_ENDPOINTS.GET_PROJECT}/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData: any) => {
    const response = await api.post(API_ENDPOINTS.CREATE_PROJECT, projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, projectData: any) => {
    const response = await api.put(`${API_ENDPOINTS.UPDATE_PROJECT}/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await api.delete(`${API_ENDPOINTS.DELETE_PROJECT}/${projectId}`);
    return response.data;
  },

  // Bulk update projects
  bulkUpdateProjects: async (operations: any[]) => {
    const response = await api.post(API_ENDPOINTS.BULK_UPDATE_PROJECTS, { operations });
    return response.data;
  },
};
