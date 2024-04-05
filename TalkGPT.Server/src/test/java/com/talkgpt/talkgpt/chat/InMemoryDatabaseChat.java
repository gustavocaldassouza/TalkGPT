package com.talkgpt.talkgpt.chat;

import java.util.ArrayList;
import java.util.List;

import com.talkgpt.talkgpt.chat.core.model.Chat;
import com.talkgpt.talkgpt.chat.core.model.Message;
import com.talkgpt.talkgpt.chat.core.ports.outgoing.ChatDatabase;

public class InMemoryDatabaseChat implements ChatDatabase {
  private List<Chat> chats;

  public InMemoryDatabaseChat() {
    chats = new ArrayList<Chat>();
  }

  @Override
  public List<Chat> fetchAllChats() {
    return chats;
  }

  public void addChat(Chat chat) {
    chats.add(chat);
  }

  @Override
  public Long CreateNewChat() {
    Chat chat = new Chat();
    chat.setId((long) chats.size() + 1);
    chats.add(chat);
    return chat.getId();
  }

  @Override
  public void DeleteChat(Long chatId) {
    for (Chat chat : chats) {
      if (chat.getId() == chatId) {
      }
    }
  }

  @Override
  public Long insertNewMessage(Message message) {
    Long chatId = 0L;
    for (Chat chat : chats) {
      if (chat.getId() == message.getChatId()) {
        chatId = chat.getId();
        if (chat.getMessages() == null) {
          chat.setMessages(new ArrayList<Message>());
        }
        chat.getMessages().add(message);
      }
    }
    return chatId;
  }

  @Override
  public Long getLastChatId() {
    return chats.getLast().getId();
  }

  @Override
  public Long getLastMessageId() {
    return chats.getLast().getMessages().getLast().getId();
  }

  @Override
  public String fetchAudio(int id) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'fetchAudio'");
  }

  @Override
  public List<Message> fetchAllMessagesByChat(Long chatId) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'fetchAllMessagesByChat'");
  }
}
