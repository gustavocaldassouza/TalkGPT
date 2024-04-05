package com.talkgpt.talkgpt.chat.core.ports.incoming;

public interface GenerateSpeech {

  byte[] generateSpeech(String text, String voice, String responsetype, String speechUrl);
}
