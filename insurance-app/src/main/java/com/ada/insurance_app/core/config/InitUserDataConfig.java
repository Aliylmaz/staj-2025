//package com.ada.insurance_app.core.config;
//
//import com.ada.insurance_app.core.enums.Role;
//import com.ada.insurance_app.entity.User;
//import com.ada.insurance_app.repository.auth.User.IUserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Configuration
//@RequiredArgsConstructor
//public class InitUserDataConfig {
//
//    private final PasswordEncoder passwordEncoder;
//
//    @Bean
//    CommandLineRunner initUsers(IUserRepository userRepository) {
//        return args -> {
//
//            if (!userRepository.existsByUsername("adminuser")) {
//                User admin = new User();
//                admin.setUsername("adminuser");
//                admin.setEmail("admin@example.com");
//                admin.setFirstName("Ali");
//                admin.setLastName("Yılmaz");
//                admin.setPassword(passwordEncoder.encode("admin123"));
//                admin.setPhoneNumber("5551234567");
//                admin.setRole(Role.ADMIN);
//                admin.setActive(true);
//                userRepository.save(admin);
//            }
//
//        };
//    }
//}
