export interface Message {
  id: number;
  text: string;
  role: 'user' | 'assistant';
  isLoading?: boolean;
}

export interface DocumentInfo {
  id: string;
  name: string;
  url: string;
  source: string;
  assistant_id: string;
  description?: string;
}