package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements SecurityUtils.CustomUserDetailsInterface {

    // Getter for User entity if needed
    private final User user;

    @Override
    public UUID getId() {
        return user.getId();
    }

 @Override
 public Collection<? extends GrantedAuthority> getAuthorities() {
     return Collections.singletonList((GrantedAuthority) () -> user.getRole().toString());
 }

    @Override public String getPassword() { return user.getPassword(); }
    @Override public String getUsername() { return user.getUsername(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

}