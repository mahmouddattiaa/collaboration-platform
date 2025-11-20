import React, { useState } from 'react';
import { Bot, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { geminiService } from '@/services/geminiService';

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help with your project today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleSendMessage = async () => {
    if (!input.trim() || !token) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // The service expects a history of a specific format.
      // We adapt the current message state to fit that format.
      const historyForApi = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: msg.content
      }));

      const response = await geminiService.chat(historyForApi, input, token);
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.text },
      ]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex items-center">
        <Bot className="mr-2 h-5 w-5 text-theme-emerald" />
        <h2 className="text-lg font-medium">AI Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-theme-primary text-white' 
                  : 'bg-white/10 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white/10 text-white flex items-center">
                <Loader className="animate-spin h-5 w-5 mr-3" />
                Thinking...
             </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
 