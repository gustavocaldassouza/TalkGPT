package com.talkgpt.talkgpt.chat.core;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.talkgpt.talkgpt.chat.core.model.Chat;
import com.talkgpt.talkgpt.chat.core.model.ChatRequest;
import com.talkgpt.talkgpt.chat.core.model.ChatResponse;
import com.talkgpt.talkgpt.chat.core.model.Message;
import com.talkgpt.talkgpt.chat.core.model.MessageRequest;
import com.talkgpt.talkgpt.chat.core.ports.incoming.DeleteChat;
import com.talkgpt.talkgpt.chat.core.ports.incoming.FetchAllChats;
import com.talkgpt.talkgpt.chat.core.ports.incoming.FetchAudio;
import com.talkgpt.talkgpt.chat.core.ports.incoming.GenerateSpeech;
import com.talkgpt.talkgpt.chat.core.ports.incoming.InsertNewMessage;
import com.talkgpt.talkgpt.chat.core.ports.incoming.TranscribeAudio;
import com.talkgpt.talkgpt.chat.core.ports.outgoing.ChatDatabase;

public class ChatFacade
    implements FetchAllChats, DeleteChat, InsertNewMessage, TranscribeAudio, GenerateSpeech, FetchAudio {
  private final ChatDatabase database;

  public ChatFacade(ChatDatabase database) {
    this.database = database;
  }

  @Override
  public List<Chat> fetchAllChats() {
    List<Chat> chats = database.fetchAllChats();
    return chats;
  }

  @Override
  public void deleteChat(Long chatId) {
    if (chatId == null) {
      throw new IllegalArgumentException("chatId must not be null");
    }
    List<Message> messages = database.fetchAllMessagesByChat(chatId);
    database.DeleteChat(chatId);
    for (Message message : messages) {
      if (message.getAudio() != null) {
        String path = message.getAudio();
        File file = new File(path);
        if (file.exists()) {
          file.delete();
        }
      }
    }
  }

  @Override
  public Message insertNewMessage(Message message, String openaiApiKey, String apiUrl, String model,
      String context, String voice, String speechUrl, boolean whisper) throws FileNotFoundException, IOException {
    if (message.getContent() == null) {
      throw new IllegalArgumentException("message must not be null");
    }
    if (openaiApiKey == null) {
      throw new IllegalArgumentException("openaiApiKey must not be null");
    }
    if (apiUrl == null) {
      throw new IllegalArgumentException("apiUrl must not be null");
    }
    if (model == null) {
      throw new IllegalArgumentException("model must not be null");
    }

    message.setRole("user");

    RestTemplate restTemplate = new RestTemplate();
    restTemplate.getInterceptors().add((request, body, execution) -> {
      request.getHeaders().add("Authorization", "Bearer " + openaiApiKey);
      return execution.execute(request, body);
    });

    MessageRequest messageSystem = new MessageRequest();
    messageSystem.setContent(context);
    messageSystem.setRole("system");

    MessageRequest messageUser = new MessageRequest();
    messageUser.setContent(message.getContent());
    messageUser.setRole(message.getRole());

    List<MessageRequest> messages = new ArrayList<MessageRequest>();
    messages.add(messageSystem);
    if (message.getChatId() > 0) {
      List<Message> allMessages = database.fetchAllMessagesByChat(message.getChatId());
      for (Message m : allMessages) {
        MessageRequest messageRequest = new MessageRequest();
        messageRequest.setContent(m.getContent());
        messageRequest.setRole(m.getRole());
        messages.add(messageRequest);
      }
    }
    messages.add(messageUser);

    ChatRequest request = new ChatRequest();
    request.setModel(model);
    request.setMessages(messages);

    ChatResponse response = restTemplate.postForObject(apiUrl, request, ChatResponse.class);

    if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
      return new Message();
    }

    if (message.getChatId() == null || message.getChatId() == 0) {
      Long chatId = database.CreateNewChat();
      message.setChatId(chatId);
    }

    if (message.getAudio() != null) {
      Long id = database.getLastMessageId();
      String path = message.getAudio();
      String newPath = java.nio.file.Paths.get(path).getParent()
          .resolve((id + 1) + ".mp3").toString();
      java.nio.file.Files.move(java.nio.file.Paths.get(path), java.nio.file.Paths.get(newPath));
      message.setAudio(newPath);
    }
    message.setId(database.insertNewMessage(message));

    var resp = response.getChoices().get(0).getMessage().getContent();

    Message newMessage = new Message();
    newMessage.setContent(resp);
    newMessage.setRole("assistant");
    newMessage.setChatId(message.getChatId());
    newMessage.setCreatedAt(Timestamp.from(java.time.Instant.now()));

    if (whisper) {
      byte[] audio = generateSpeech(newMessage.getContent(), openaiApiKey, speechUrl, voice);

      String path = System.getProperty("user.dir");
      String uploadDir = path + "/upload/";
      String filePath = uploadDir + (message.getId() + 1) + ".mp3";
      java.io.File dir = new java.io.File(uploadDir);
      if (!dir.exists()) {
        dir.mkdirs();
      }

      File file = new File(filePath);
      try (FileOutputStream fos = new FileOutputStream(file)) {
        try {
          fos.write(audio);
          newMessage.setAudio(filePath);
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    newMessage.setId(database.insertNewMessage(newMessage));

    return newMessage;
  }

  public byte[] generateSpeech(String message, String apiKey, String speechURL, String voice) {
    if (apiKey == null) {
      throw new IllegalArgumentException("apiKey must not be null");
    }
    if (speechURL == null) {
      throw new IllegalArgumentException("speechURL must not be null");
    }

    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + apiKey);

    Map<String, Object> data = new HashMap<>();
    data.put("model", "tts-1");
    data.put("input", message);
    data.put("voice", voice);
    data.put("response_format", "mp3");

    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(data, headers);

    @SuppressWarnings("null")
    ResponseEntity<byte[]> responseEntity = restTemplate.exchange(speechURL, HttpMethod.POST, requestEntity,
        byte[].class);
    byte[] responseData = responseEntity.getBody();

    return responseData;
  }

  @Override
  public Message transcribeAudio(MultipartFile audio, String openaiApiKey, String apiUrlTranscribe) {
    if (openaiApiKey == null) {
      throw new IllegalArgumentException("openaiApiKey must not be null");
    }
    if (apiUrlTranscribe == null) {
      throw new IllegalArgumentException("apiUrlTranscribe must not be null");
    }

    String path = System.getProperty("user.dir");
    String uploadDir = path + "/upload/";
    java.io.File dir = new java.io.File(uploadDir);
    if (!dir.exists()) {
      dir.mkdirs();
    }

    String timestamp = java.time.Instant.now().toString().replace(":", "-").replace(".", "-");
    String filePath = uploadDir + timestamp + ".mp3";
    java.io.File file = new java.io.File(filePath);

    Message message = new Message();

    try {
      audio.transferTo(file);
      message.setAudio(filePath);
    } catch (IOException e) {
      e.printStackTrace();
    }

    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
    body.add("file", new FileSystemResource(filePath));
    body.add("model", "whisper-1");
    body.add("response_format", "text");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    headers.setBearerAuth(openaiApiKey);

    HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
    RestTemplate restTemplate = new RestTemplate();

    try {
      @SuppressWarnings("null")
      ResponseEntity<String> response = restTemplate.exchange(
          apiUrlTranscribe,
          HttpMethod.POST,
          requestEntity,
          String.class);
      message.setContent(response.getBody());
      return message;
    } catch (HttpClientErrorException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public byte[] fetchAudio(int id) {
    String filePath = database.fetchAudio(id);
    try {
      if (filePath == null) {
        return new byte[0];
      }
      return java.nio.file.Files.readAllBytes(java.nio.file.Path.of(filePath));
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

}
