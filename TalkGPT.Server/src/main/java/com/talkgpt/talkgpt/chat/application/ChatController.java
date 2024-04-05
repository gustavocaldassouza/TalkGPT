package com.talkgpt.talkgpt.chat.application;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.talkgpt.talkgpt.chat.core.model.Chat;
import com.talkgpt.talkgpt.chat.core.model.Message;

import com.talkgpt.talkgpt.chat.core.ports.incoming.DeleteChat;
import com.talkgpt.talkgpt.chat.core.ports.incoming.FetchAllChats;
import com.talkgpt.talkgpt.chat.core.ports.incoming.FetchAudio;
import com.talkgpt.talkgpt.chat.core.ports.incoming.InsertNewMessage;
import com.talkgpt.talkgpt.chat.core.ports.incoming.TranscribeAudio;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
  @Qualifier("FetchAllChats")
  private final FetchAllChats fetchAllChats;
  @Qualifier("DeleteChat")
  private final DeleteChat deleteChat;
  @Qualifier("InsertNewMessage")
  private final InsertNewMessage insertNewMessage;
  @Qualifier("TranscribeAudio")
  private final TranscribeAudio transcribeAudio;
  @Qualifier("FetchAudio")
  private final FetchAudio fetchAudio;
  @Value("${openai.model}")
  private String model;
  @Value("${openai.api.key}")
  private String openaiApiKey;
  @Value("${openai.api.url}")
  private String apiUrl;
  @Value("${openai.api.whisper.url}")
  private String apiWhisperUrl;
  @Value("${openai.api.speech.url}")
  private String speechUrl;
  @Value("${openai.ai.voice}")
  private String voice;
  @Value("${openai.ai.responsetype}")
  private boolean responsetype;
  @Value("${openai.ai.context}")
  private String context;

  @GetMapping()
  public ResponseEntity<List<Chat>> fetchAllChats() {
    try {
      var chats = fetchAllChats.fetchAllChats();
      return ResponseEntity.ok(chats);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @DeleteMapping("/{chatId}")
  public ResponseEntity<String> deleteChat(@PathVariable(value = "chatId") Long chatId) {
    try {
      deleteChat.deleteChat(chatId);
      return ResponseEntity.ok("Chat " + chatId + " deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PostMapping()
  public ResponseEntity<Message> insertNewMessage(@RequestBody Message message) {
    try {
      var response = insertNewMessage.insertNewMessage(message, openaiApiKey, apiUrl, model, context, voice,
          speechUrl, responsetype);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PutMapping("/set/key/{key}")
  public ResponseEntity<String> setKey(@PathVariable(value = "key") String key) {
    try {
      openaiApiKey = key;
      return ResponseEntity.ok().body("Key set to: " + key);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }

  }

  @PutMapping("/set/voice/{voice}")
  public ResponseEntity<String> setVoice(@PathVariable(value = "voice") String voice) {
    try {
      this.voice = voice;
      return ResponseEntity.ok().body("Voice set to: " + voice);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }

  }

  @PutMapping("/set/model/{model}")
  public ResponseEntity<String> setModel(@PathVariable String model) {
    try {
      this.model = model;
      return ResponseEntity.ok().body("Model set to: " + model);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PutMapping("/set/responsetype/{responsetype}")
  public ResponseEntity<String> setResponsetype(@PathVariable String responsetype) {
    try {
      if (responsetype.equals("0")) {
        this.responsetype = true;
      } else if (responsetype.equals("1")) {
        this.responsetype = false;
      }
      return ResponseEntity.ok().body("ResponseType set to: " + responsetype);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PutMapping("/set/context/{context}")
  public ResponseEntity<String> setContext(@PathVariable String context) {
    try {
      this.context = context;
      return ResponseEntity.ok().body("Context set to: " + context);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PostMapping("/transcribe")
  public ResponseEntity<Message> transcribeAudio(@RequestBody MultipartFile audio) {
    try {
      Message transcribedAudio = transcribeAudio.transcribeAudio(audio, openaiApiKey, apiWhisperUrl);
      return ResponseEntity.ok(transcribedAudio);
    } catch (Exception e) {
      System.out.println(e.getMessage());
      return ResponseEntity.badRequest().body(null);
    }
  }

  @GetMapping("/audio/{id}")
  public ResponseEntity<byte[]> fetchAudio(@PathVariable int id) {
    try {
      var audio = fetchAudio.fetchAudio(id);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
      return ResponseEntity.ok(audio);
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().body(null);
    }
  }

}
