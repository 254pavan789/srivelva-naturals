package com.srivelva.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    /*
     * WHY @Value WITH String[] FAILS FOR COMMA-SEPARATED LISTS:
     *
     * When a property value is a plain comma-separated string, Spring's @Value
     * annotation DOES NOT automatically split it into a String[] if the value
     * comes from a ${...} placeholder that resolves to a string like
     * "http://localhost:3000,http://localhost:5173".
     *
     * The split only works when the values are listed individually in the
     * properties file (one per line with the same key) — which doesn't apply
     * here because we want a single env-var-overridable property.
     *
     * FIX: inject as a single String and split manually with trim() to remove
     * any accidental whitespace around commas.
     */
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOriginsRaw;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Split and trim — "http://a, http://b" → ["http://a", "http://b"]
                String[] origins = allowedOriginsRaw.split(",");
                for (int i = 0; i < origins.length; i++) {
                    origins[i] = origins[i].trim();
                }

                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
