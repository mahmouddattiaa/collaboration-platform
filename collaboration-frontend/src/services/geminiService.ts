import apiClient from './apiClient';
import { Message } from '@/contexts/CollaborationContext'; // Assuming Message type can be reused

interface GeminiChatRequest {
  history: { role: 'user' | 'assistant' | 'model'; parts: string }[];
  message: string;
}

interface GeminiChatResponse {
  text: string;
}

class GeminiService {
  async chat(
    history: Message[],
    message: string,
    token: string
  ): Promise<GeminiChatResponse> {

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.content,
    }));

    const response = await apiClient.post<GeminiChatResponse>(
      '/api/gemini/chat',
      { history: formattedHistory, message },
      token
    );
    return response as GeminiChatResponse;
  }
}

export const geminiService = new GeminiService();
export default geminiService;
