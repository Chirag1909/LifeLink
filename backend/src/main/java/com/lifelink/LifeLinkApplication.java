package com.lifelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LifeLinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(LifeLinkApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" LifeLink Spring Boot & JDBC Server running on port 5000 ");
        System.out.println(" API Root: http://localhost:5000/api                     ");
        System.out.println(" H2 Console: http://localhost:5000/h2-console           ");
        System.out.println("==========================================================");
    }
}
