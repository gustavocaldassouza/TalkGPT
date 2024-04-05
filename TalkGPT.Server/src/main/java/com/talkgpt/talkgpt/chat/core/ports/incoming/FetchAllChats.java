package com.talkgpt.talkgpt.chat.core.ports.incoming;

import java.util.List;

import com.talkgpt.talkgpt.chat.core.model.Chat;

public interface FetchAllChats {
  List<Chat> fetchAllChats();
}