import axios from 'axios';

// Configuration
const API_BASE_URL = "http://127.0.0.1:8000";
const USER_ID = "test_user"; // Hardcoded for MVP

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Types (Matches your Python Models) ---
export interface BackendNote {
  _id: string;
  user_id: string;
  category_id: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  archived: boolean;
  is_reminder: boolean;
}

export interface BackendCategory {
  _id: string;
  name: string;
  description?: string;
  color_code?: string;
}

export interface AnalyticsData {
  category_name: string;
  note_count: number;
  color_code?: string;
}

// --- API Functions ---

export const NoteNestAPI = {
  // Notes
  getNotes: async (archived = false): Promise<BackendNote[]> => {
    const response = await api.get(`/notes/${USER_ID}?archived=${archived}`);
    return response.data;
  },

  createSmartNote: async (content: string): Promise<BackendNote> => {
    const response = await api.post('/smart-notes/', {
      user_id: USER_ID,
      content: content,
      llm_ref: "frontend-client"
    });
    return response.data;
  },

  // New function for UPDATE operation
  updateNote: async (noteId: string, content: string, categoryId: string): Promise<BackendNote> => {
    const response = await api.put(`/notes/${noteId}`, {
      content: content,
      category_id: categoryId
    });
    return response.data;
  },

  archiveNote: async (noteId: string): Promise<BackendNote> => {
    const response = await api.put(`/notes/${noteId}/archive?user_id=${USER_ID}`);
    return response.data;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await api.delete(`/notes/${noteId}`);
  },

  // Categories
  getCategories: async (): Promise<BackendCategory[]> => {
    const response = await api.get(`/categories/${USER_ID}`);
    return response.data;
  },

  createCategory: async (name: string, desc: string, color: string): Promise<BackendCategory> => {
    const response = await api.post('/categories/', {
      user_id: USER_ID,
      name: name,
      description: desc,
      color_code: color
    });
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}?user_id=${USER_ID}`);
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsData[]> => {
    const response = await api.get(`/analytics/${USER_ID}`);
    return response.data;
  }
};