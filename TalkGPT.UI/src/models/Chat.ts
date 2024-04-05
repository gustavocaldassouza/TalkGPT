import Message from "./Message";

export default interface Chat {
  id: number;
  createdAt: string;
  messages: Message[];
}