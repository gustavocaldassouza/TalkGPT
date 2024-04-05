package com.talkgpt.talkgpt.chat;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.talkgpt.talkgpt.chat.core.ChatFacade;
import com.talkgpt.talkgpt.chat.core.model.Chat;

import lombok.RequiredArgsConstructor;

@SpringBootTest
@RequiredArgsConstructor
public class ChatFacadeTest {
  private ChatFacade chatFacade;
  private InMemoryDatabaseChat inMemoryDatabaseChat;

  @BeforeEach
  public void setup() {
    inMemoryDatabaseChat = new InMemoryDatabaseChat();
    chatFacade = new ChatFacade(inMemoryDatabaseChat);
  }

  @Test
  @DisplayName("Should return an empty list if no chats found")
  public void shouldReturnEmptyListIfNoChatsFound() {
    List<Chat> chats = chatFacade.fetchAllChats();

    assertTrue(chats.isEmpty());
  }
}
