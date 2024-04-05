export default interface Message {
  isUser: boolean;
  content: string;
  chatId?: number;
  role?: string;
  createdAt?: string;
  id: number;
  audio?: string;
  audio_preview?: string;
  preview?: boolean;
  cancelled?: boolean;
}
