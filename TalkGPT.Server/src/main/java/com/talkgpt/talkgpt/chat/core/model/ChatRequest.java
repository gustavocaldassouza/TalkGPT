package com.talkgpt.talkgpt.chat.core.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequest {
    private String model;
    private List<MessageRequest> messages;
}
