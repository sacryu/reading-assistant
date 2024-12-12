export interface Message {
  id: number;
  text: string;
  role: 'user' | 'assistant';
  isThinking?: boolean;     // 用于显示三个点的思考动画
  isStreaming?: boolean;   // 用于显示头像的输出动画
}

export interface DocumentInfo {
  id: string;
  name: string;
  url: string;
  source: string;
  assistant_id: string;
  description?: string;
}