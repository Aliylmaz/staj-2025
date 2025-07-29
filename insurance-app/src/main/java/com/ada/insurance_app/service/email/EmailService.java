package com.ada.insurance_app.service.email;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {


    private final JavaMailSender javaMailSender;
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    public void sendPasswordResetEmail(String toEmail, String resetToken) {

        String subject = "🔐 Password Reset Request - InsuranceApp";

        String resetUrl = frontendBaseUrl + "/reset-password?token=" + resetToken;


        String content = """
        Hello,

        We received a request to reset your password for your InsuranceApp account.

        Please click the link below to reset your password:

        %s

        If you did not request this, please ignore this email.

        This link will expire in 5 minutes for security reasons.

        Best regards,
        InsuranceApp Team
        """.formatted(resetUrl);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);

        javaMailSender.send(message);
    }

}
