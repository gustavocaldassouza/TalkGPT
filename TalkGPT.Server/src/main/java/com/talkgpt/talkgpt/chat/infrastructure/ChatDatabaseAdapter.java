package com.talkgpt.talkgpt.chat.infrastructure;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.talkgpt.talkgpt.chat.core.model.Chat;
import com.talkgpt.talkgpt.chat.core.model.Message;
import com.talkgpt.talkgpt.chat.core.ports.outgoing.ChatDatabase;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ChatDatabaseAdapter implements ChatDatabase {
  private final JdbcTemplate jdbcTemplate;

  @Override
  public List<Chat> fetchAllChats() {
    try {
      var chats = jdbcTemplate.query(
          "SELECT ID as id, CREATED_AT as createdAt FROM CHAT",
          new BeanPropertyRowMapper<>(Chat.class));
      var messages = jdbcTemplate.query(
          "SELECT ID as id, CHAT_ID as chatId, CONTENT as content, ROLE as role, AUDIO as audio, CREATED_AT as createdAt FROM MESSAGE",
          new BeanPropertyRowMapper<>(Message.class));
      for (Chat chat : chats) {
        chat.setMessages(new ArrayList<Message>());
        for (Message message : messages) {
          if (message.getChatId() == chat.getId()) {
            chat.getMessages().add(message);
          }
        }
      }

      return chats;
    } catch (Exception e) {
      e.printStackTrace();
      throw e;
    }
  }

  @Override
  public Long CreateNewChat() {
    try {
      String sql = "INSERT INTO CHAT (ID) SELECT COALESCE(MAX(ID) + 1, 1) FROM CHAT";
      int affectedRows = jdbcTemplate.update(sql);
      if (affectedRows == 0) {
        throw new RuntimeException("Failed to insert new chat into DB");
      }
      return getLastChatId();
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }

  @Override
  @Transactional
  public void DeleteChat(Long chatId) {
    try {
      String deleteMessageSql = "DELETE FROM MESSAGE WHERE CHAT_ID = ?";
      String deleteChatSql = "DELETE FROM CHAT WHERE ID = ?";
      jdbcTemplate.update(deleteMessageSql, chatId);
      jdbcTemplate.update(deleteChatSql, chatId);
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }

  @Override
  public Long insertNewMessage(Message message) {
    try {
      String sql = "INSERT INTO MESSAGE (ID, CHAT_ID, CONTENT, AUDIO, ROLE) SELECT COALESCE(MAX(ID) + 1, 1), ?, ?, ?, ? FROM MESSAGE";
      jdbcTemplate.update(sql, message.getChatId(), message.getContent(), message.getAudio(), message.getRole());
      return getLastMessageId();
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }

  @Override
  public Long getLastChatId() {
    try {
      String sql = "SELECT COALESCE(MAX(ID), 1) FROM CHAT";
      return jdbcTemplate.queryForObject(sql, Long.class);
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }

  @Override
  public Long getLastMessageId() {
    try {
      String sql = "SELECT COALESCE(MAX(ID), 0) FROM MESSAGE";
      return jdbcTemplate.queryForObject(sql, Long.class);
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }

  @Override
  public String fetchAudio(int id) {
    String sql = "SELECT AUDIO FROM MESSAGE WHERE ID = ?";
    String filePath = jdbcTemplate.queryForObject(sql, String.class, id);
    return filePath;
  }

  @Override
  public List<Message> fetchAllMessagesByChat(Long chatId) {
    try {
      var messages = jdbcTemplate.query(
          "SELECT ID as id, CHAT_ID as chatId, CONTENT as content, ROLE as role, AUDIO as audio, CREATED_AT as createdAt FROM MESSAGE WHERE CHAT_ID = ? ORDER BY ID",
          new BeanPropertyRowMapper<>(Message.class), chatId);

      return messages;
    } catch (Exception e) {
      System.out.println("Error: " + e.getMessage());
      throw e;
    }
  }
}
