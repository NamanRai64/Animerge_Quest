package edu.srm.animalMerge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class AnimalMergeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnimalMergeApplication.class, args);
	}

    /**
     * Configures a global CORS policy. 
     * The allowedOrigins("*") is necessary to allow the 'null' origin when 
     * running the HTML file directly from the file system (file://).
     */
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**") 
						.allowedOrigins("*") 
                        // Allow GET for the query parameter request
                        // Allow OPTIONS for the CORS preflight check
                        .allowedMethods("GET", "OPTIONS"); 
			}
		};
	}
}