import { XiaohongshuBot } from '@/lib/xiaohongshuBot';

// 创建小红书爆款内容制作助手的API处理函数
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return new Response(JSON.stringify({ error: '消息不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 初始化小红书爆款内容制作助手
    const bot = new XiaohongshuBot();
    
    // 处理用户消息并获取响应
    const response = await bot.handleUserMessage(message);
    
    // 返回响应
    return new Response(JSON.stringify({ response: response.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('处理请求时出错:', error);
    return new Response(JSON.stringify({ error: '处理请求时出错' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
