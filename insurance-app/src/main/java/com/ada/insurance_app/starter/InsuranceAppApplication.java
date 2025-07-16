package com.ada.insurance_app.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.ada")
@ComponentScan(basePackages = "com.ada")
@EnableJpaRepositories(basePackages = "com.ada")
public class InsuranceAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsuranceAppApplication.class, args);
	}

}
