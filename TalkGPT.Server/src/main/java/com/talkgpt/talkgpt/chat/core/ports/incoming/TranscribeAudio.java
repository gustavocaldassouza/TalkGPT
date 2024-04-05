package com.talkgpt.talkgpt.chat.core.ports.incoming;

import org.springframework.web.multipart.MultipartFile;

import com.talkgpt.talkgpt.chat.core.model.Message;

public interface TranscribeAudio {

  public Message transcribeAudio(MultipartFile audioFile, String openaiApiKey, String apiUrlTranscribe);
}
