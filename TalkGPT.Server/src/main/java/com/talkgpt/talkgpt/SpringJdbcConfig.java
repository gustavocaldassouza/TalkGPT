package com.talkgpt.talkgpt;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
@ComponentScan("com.talkgpt.jdbc")
public class SpringJdbcConfig {
  @Bean
  public DataSource mysqlDataSource() {
    DriverManagerDataSource dataSource = new DriverManagerDataSource();
    // dataSource.setUrl("jdbc:mysql://localhost:3306/TALKGPT");
    dataSource
        .setUrl("jdbc:mysql://db:3306/TALKGPT?allowPublicKeyRetrieval=true&useSSL=false&createDatabaseIfNotExist=true");
    dataSource.setUsername("TALK");
    dataSource.setPassword("Password123");

    return dataSource;
  }
}
