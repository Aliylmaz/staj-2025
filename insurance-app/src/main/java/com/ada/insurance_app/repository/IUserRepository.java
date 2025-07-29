package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.core.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByRole(Role role);
    List<User> findByActive(boolean active);
    long countByRole(Role role);
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findTop5ByOrderByCreatedAtDesc();
}
