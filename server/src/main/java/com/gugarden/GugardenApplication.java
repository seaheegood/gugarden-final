package com.gugarden;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GugardenApplication {

    public static void main(String[] args) {
        SpringApplication.run(GugardenApplication.class, args);
    }
}
