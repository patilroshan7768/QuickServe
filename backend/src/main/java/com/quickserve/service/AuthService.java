package com.quickserve.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quickserve.dto.AuthResponse;
import com.quickserve.dto.LoginRequest;
import com.quickserve.dto.RegisterRequest;
import com.quickserve.entity.Role;
import com.quickserve.entity.User;
import com.quickserve.exception.ConflictException;
import com.quickserve.exception.ResourceNotFoundException;
import com.quickserve.repository.UserRepository;
import com.quickserve.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        String phone = (request.phone() == null || request.phone().isBlank()) ? null : request.phone().trim();
        User user = new User(request.name().trim(), email,
                passwordEncoder.encode(request.password()), phone, Role.CUSTOMER);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Two people registering the same email at the same moment: the DB unique constraint wins.
            throw new ConflictException("An account with this email already exists");
        }
        return AuthResponse.of(user, jwtService.generateToken(user.getEmail(), user.getRole()));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        // Throws BadCredentialsException (handled as 401) if the email or password is wrong.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.of(user, jwtService.generateToken(user.getEmail(), user.getRole()));
    }
}
