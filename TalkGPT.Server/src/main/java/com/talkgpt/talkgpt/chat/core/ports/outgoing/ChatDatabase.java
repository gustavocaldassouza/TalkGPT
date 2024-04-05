package com.talkgpt.talkgpt.chat.core.ports.outgoing;

import java.util.List;

import com.talkgpt.talkgpt.chat.core.model.Chat;
import com.talkgpt.talkgpt.chat.core.model.Message;

public interface ChatDatabase {
  List<Chat> fetchAllChats();

  Long CreateNewChat();

  void DeleteChat(Long chatId);

  Long insertNewMessage(Message message);

  Long getLastChatId();

  Long getLastMessageId();

  String fetchAudio(int id);

  List<Message> fetchAllMessagesByChat(Long chatId);
}
