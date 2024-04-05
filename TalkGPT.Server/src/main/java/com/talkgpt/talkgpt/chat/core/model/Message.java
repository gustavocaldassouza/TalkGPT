package com.talkgpt.talkgpt.chat.core.model;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Message {
  private Long id;
  private Long chatId;
  private String content;
  private String role;
  private String audio;
  private Timestamp createdAt;
}
