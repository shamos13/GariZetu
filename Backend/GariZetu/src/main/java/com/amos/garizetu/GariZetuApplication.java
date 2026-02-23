package com.amos.garizetu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GariZetuApplication {

	public static void main(String[] args) {
		SpringApplication.run(GariZetuApplication.class, args);
	}

}
