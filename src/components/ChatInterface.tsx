'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onSubmit: (message: string) => Promise<string>;
}

export default function ChatInterface({ onSubmit }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是小红书爆款内容制作助手。我可以帮你收集小红书近1个月的爆款笔记，分析其元素特点，并根据分析结果制作类似的爆款内容及图片。请告诉我你感兴趣的关键词和类目，例如"敏感肌保湿产品测评"或"复古风穿搭分享"。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from the bot
      const response = await onSubmit(input);
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: '抱歉，处理您的请求时出现了问题。请稍后再试。' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的需求，例如：帮我做一个敏感肌护肤的爆款内容..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
            disabled={isLoading}
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
