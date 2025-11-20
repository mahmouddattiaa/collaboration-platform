import apiClient from './apiClient';
import { ApiResponse } from '@/types/api';

interface GeminiHistoryItem {
  role: 'user' | 'assistant' | 'model';
  parts: string;
}

interface GeminiChatRequest {
  history: GeminiHistoryItem[];
  message: string;
}

interface GeminiChatResponse {
  text: string;
}

class GeminiService {
  async chat(
    history: GeminiHistoryItem[],
    message: string,
    token: string
  ): Promise<GeminiChatResponse> {

    const response = await apiClient.post<GeminiChatResponse>(
      '/api/gemini/chat',
      { history, message },
      token
    );
    
    // apiClient.post returns ApiResponse<GeminiChatResponse>
    // Extract the data or return the response itself if it's already in the right format
    if (response.data) {
      return response.data;
    }
    
    // Fallback if the API returns the data directly
    return response as unknown as GeminiChatResponse;
  }
}

export const geminiService = new GeminiService();
export default geminiService;
