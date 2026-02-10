package com.gugarden.service;

import com.gugarden.dto.request.*;
import com.gugarden.entity.User;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.exception.UnauthorizedException;
import com.gugarden.repository.CartItemRepository;
import com.gugarden.repository.UserRepository;
import com.gugarden.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            throw new BadRequestException("이메일, 비밀번호, 이름은 필수입니다.");
        }

        if (request.getPassword().length() < 6) {
            throw new BadRequestException("비밀번호는 6자 이상이어야 합니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "회원가입이 완료되었습니다.");
        result.put("token", token);
        result.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        ));
        return result;
    }

    public Map<String, Object> login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("이메일과 비밀번호를 입력해주세요.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 일치하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "로그인 성공");
        result.put("token", token);
        result.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        ));
        return result;
    }

    public Map<String, Object> getMe(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName());
        userMap.put("phone", user.getPhone());
        userMap.put("address", user.getAddress());
        userMap.put("address_detail", user.getAddressDetail());
        userMap.put("zipcode", user.getZipcode());
        userMap.put("role", user.getRole().name());
        userMap.put("created_at", user.getCreatedAt());

        return Map.of("user", userMap);
    }

    @Transactional
    public Map<String, String> updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setAddressDetail(request.getAddressDetail());
        user.setZipcode(request.getZipcode());

        userRepository.save(user);

        return Map.of("message", "정보가 수정되었습니다.");
    }

    @Transactional
    public Map<String, String> changePassword(Integer userId, ChangePasswordRequest request) {
        if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
            throw new BadRequestException("현재 비밀번호와 새 비밀번호를 입력해주세요.");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("비밀번호는 6자 이상이어야 합니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenBlacklistService.invalidateUser(userId);

        String newToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Map<String, String> result = new HashMap<>();
        result.put("message", "비밀번호가 변경되었습니다.");
        result.put("token", newToken);
        return result;
    }

    @Transactional
    public Map<String, String> deleteAccount(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 장바구니 삭제
        cartItemRepository.deleteByUserId(userId);

        // 개인정보 익명화
        user.setEmail("withdrawn_" + userId + "_" + System.currentTimeMillis() + "@deleted.local");
        user.setPassword(null);
        user.setName("탈퇴회원");
        user.setPhone(null);
        user.setAddress(null);
        user.setAddressDetail(null);
        user.setZipcode(null);
        user.setProvider(User.Provider.local);
        user.setProviderId(null);
        user.setProfileImage(null);

        userRepository.save(user);

        tokenBlacklistService.invalidateUser(userId);

        return Map.of("message", "회원 탈퇴가 완료되었습니다.");
    }

    // 소셜 로그인 처리
    @Transactional
    public String handleSocialLogin(User.Provider provider, String providerId, String email, String name, String phone, String profileImage) {
        List<User> existingUsers = userRepository.findByProviderAndProviderIdOrEmail(provider, providerId, email);

        User user;
        if (!existingUsers.isEmpty()) {
            user = existingUsers.get(0);
            if (user.getProvider() == User.Provider.local) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setProfileImage(profileImage);
                if (phone != null && user.getPhone() == null) {
                    user.setPhone(phone);
                }
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .phone(phone)
                    .provider(provider)
                    .providerId(providerId)
                    .profileImage(profileImage)
                    .build();
            userRepository.save(user);
        }

        return jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }
}
