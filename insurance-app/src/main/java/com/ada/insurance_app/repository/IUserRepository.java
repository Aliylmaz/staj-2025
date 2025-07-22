package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IUserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByActive(boolean active);

    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:keyword% OR u.lastName LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);

    Optional<User> findByPhoneNumber(String phoneNumber);

    // Role tekil olduğu için doğrudan karşılaştırma yeterli
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.id = :userId AND u.role = :role")
    boolean hasRole(@Param("userId") UUID userId, @Param("role") Role role);
}
