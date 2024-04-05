package com.talkgpt.talkgpt.chat.core.ports.incoming;

import java.io.FileNotFoundException;
import java.io.IOException;

import com.talkgpt.talkgpt.chat.core.model.Message;

public interface InsertNewMessage {
  /*
   * Insert a new message into the database
   * Generate Response from OpenAI
   * Create chat in database
   * Insert response into database
   * if response is type Voice transribe it
   * Insert message into database
   * returns: Response
   */
  Message insertNewMessage(Message message, String openaiApiKey, String apiUrl, String model, String context,
      String voice, String speechUrl, boolean whisper) throws FileNotFoundException, IOException;
}