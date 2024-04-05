package com.talkgpt.talkgpt.chat.core.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatResponse {
    private List<Choice> choices;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Choice {
        private int index;
        private Message message;
    }
}
