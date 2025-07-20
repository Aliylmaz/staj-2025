package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


import com.ada.insurance_app.core.enums.Role;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByActive(boolean active);


    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles")
    List<User> findUsersByRole(@Param("role") Role role);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:keyword% OR u.lastName LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<User> searchUsers(@Param("keyword") String keyword);

    Optional<User> findByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.id = :userId AND :role MEMBER OF u.roles")
    boolean hasRole(@Param("userId") UUID userId, @Param("role") Role role);
}