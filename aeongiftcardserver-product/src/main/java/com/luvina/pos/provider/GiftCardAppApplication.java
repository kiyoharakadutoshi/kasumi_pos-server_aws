package com.luvina.pos.provider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GiftCardAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftCardAppApplication.class, args);
    }

}
