package com.ada.insurance_app.entity;


import com.ada.insurance_app.core.enums.PasswordResetTokenStatus;
import com.ada.insurance_app.entity.User;
    import com.ada.insurance_app.core.enums.PasswordResetTokenStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_reset_tokens",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_password_reset_token", columnNames = "password_reset_token")
        },
        indexes = {
                @Index(name = "idx_token", columnList = "password_reset_token"),
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_expires_at", columnList = "expires_at"),
                @Index(name = "idx_status", columnList = "password_reset_token_status")
        })
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID passwordResetTokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_password_reset_token_user_id"))
    private User user;

    @Column(name = "password_reset_token", nullable = false, unique = true, length = 512)
    private String passwordResetToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "password_reset_token_status", nullable = false)
    @Builder.Default
    private PasswordResetTokenStatus passwordResetTokenStatus = PasswordResetTokenStatus.ACTIVE;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.expiresAt == null) {
            this.expiresAt = LocalDateTime.now().plusMinutes(5);
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isValid() {
        return passwordResetTokenStatus == PasswordResetTokenStatus.ACTIVE && !isExpired();
    }

    public void markAsUsed() {
        if (!this.used) {
            this.used = true;
            this.passwordResetTokenStatus = PasswordResetTokenStatus.USED;
        }
    }

    public void markAsExpired() {
        if (passwordResetTokenStatus == PasswordResetTokenStatus.ACTIVE) {
            this.passwordResetTokenStatus = PasswordResetTokenStatus.EXPIRED;
        }
    }

    public boolean isUsed() {
        return used || passwordResetTokenStatus == PasswordResetTokenStatus.USED;
    }

    public boolean hasExpiredStatus() {
        return passwordResetTokenStatus == PasswordResetTokenStatus.EXPIRED;
    }

    public boolean isActive() {
        return passwordResetTokenStatus == PasswordResetTokenStatus.ACTIVE;
    }

    public boolean isExpiredButNotMarked() {
        return passwordResetTokenStatus == PasswordResetTokenStatus.ACTIVE && isExpired();
    }

    public String getStatusDescription() {
        if (isUsed()) {
            return "USED - Token has been successfully used";
        } else if (isExpired()) {
            return "EXPIRED - Token has expired";
        } else if (isActive()) {
            return "ACTIVE - Token is available for use";
        } else {
            return passwordResetTokenStatus.getDescription();
        }
    }

    public boolean isCreatedRecently(int minutes) {
        return createdAt.isAfter(LocalDateTime.now().minusMinutes(minutes));
    }

    public boolean canBeUsed() {
        return !used
                && passwordResetTokenStatus == PasswordResetTokenStatus.ACTIVE
                && expiresAt.isAfter(LocalDateTime.now());
    }


    public long getRemainingMinutes() {
        if (isExpired()) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toMinutes();
    }
}