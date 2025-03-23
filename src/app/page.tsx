'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return '抱歉，处理您的请求时出现了问题。请稍后再试。';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-pink-500 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">小红书爆款内容制作助手</h1>
          <p className="text-sm opacity-80">
            收集小红书近1个月的爆款笔记，分析其元素特点，并根据分析结果制作类似内容及图片
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <ChatInterface onSubmit={handleSubmit} />
        </div>
      </div>

      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <p>© 2025 小红书爆款内容制作助手 | 基于Next.js开发</p>
      </footer>
    </main>
  );
}
