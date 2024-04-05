package com.talkgpt.talkgpt.chat;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.talkgpt.talkgpt.chat.core.ChatFacade;
import com.talkgpt.talkgpt.chat.core.ports.incoming.FetchAllChats;
import com.talkgpt.talkgpt.chat.core.ports.outgoing.ChatDatabase;
import com.talkgpt.talkgpt.chat.infrastructure.ChatDatabaseAdapter;

@Configuration
public class ChatConfig {
  @Bean
  public ChatDatabase chatDatabase(JdbcTemplate jdbcTemplate) {
    return new ChatDatabaseAdapter(jdbcTemplate);
  }

  @Bean
  @Qualifier("FetchAllChats")
  public FetchAllChats fetchAllChats(ChatDatabase chatDatabase) {
    return new ChatFacade(chatDatabase);
  }
}