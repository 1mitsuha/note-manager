import axios from 'axios';
import { Note } from '../types/Note';

// 根据环境变量设置 API 基础 URL，如果没有设置则使用本地开发服务器地址
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加响应拦截器处理常见错误
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get('/notes');
  return response.data;
};

export const createNote = async (title: string, content: string): Promise<Note> => {
  const response = await api.post('/notes', { title, content });
  return response.data;
};

export const updateNote = async (id: number, title: string, content: string): Promise<Note> => {
  const response = await api.put(`/notes/${id}`, { title, content });
  return response.data;
};

export const deleteNote = async (id: number): Promise<void> => {
  await api.delete(`/notes/${id}`);
};

export const searchNotes = async (query: string): Promise<Note[]> => {
  const response = await api.get('/notes/search', { params: { q: query } });
  return response.data;
}; 