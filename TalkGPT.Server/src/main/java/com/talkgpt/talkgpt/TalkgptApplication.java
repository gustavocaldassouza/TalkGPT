package com.talkgpt.talkgpt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.talkgpt.talkgpt.chat.ChatConfig;

@SpringBootApplication
@Import(ChatConfig.class)
public class TalkgptApplication {
	public static void main(String[] args) {
		SpringApplication.run(TalkgptApplication.class, args);
	}

	@Configuration
	public class CorsConfig implements WebMvcConfigurer {
		@Override
		public void addCorsMappings(@SuppressWarnings("null") CorsRegistry registry) {
			registry.addMapping("/**")
					.allowedOrigins("*")
					.allowedMethods("GET", "POST", "PUT", "DELETE")
					.allowedHeaders("*");
		}
	}
}
