package com.employeeformapp.service;

import com.employeeformapp.model.User;
import com.employeeformapp.repository.UserRepository;
import com.employeeformapp.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> signup(User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    public ResponseEntity<?> login(User user) {

        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required.");
        }

        User existingUser = userRepository.findByUsername(user.getUsername());
        System.out.println("LOGIN DEBUG --> Username: " + user.getUsername());
        System.out.println("LOGIN DEBUG --> Raw Password: " + user.getPassword());
        System.out.println("LOGIN DEBUG --> DB Password: " + existingUser.getPassword());
        boolean passwordMatch = BCrypt.checkpw(user.getPassword(), existingUser.getPassword());
        System.out.println("LOGIN DEBUG --> Match Result: " + passwordMatch);

        if (existingUser != null && BCrypt.checkpw(user.getPassword(), existingUser.getPassword())) {

            String token = jwtUtil.generateToken(existingUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", existingUser.getRole());
            response.put("message", "Login successful");

            // ⭐ ADD EMPLOYEE ID IF EXISTS
            if (existingUser.getEmployee() != null) {
            	response.put("employeeId", String.valueOf(existingUser.getEmployee().getId()));

            } else {
                response.put("employeeId", null); // or skip completely
            }

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid username or password");
    }
}
