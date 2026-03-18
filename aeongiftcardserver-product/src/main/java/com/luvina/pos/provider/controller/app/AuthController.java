package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.dto.app.AppUserDto;
import com.luvina.pos.provider.dto.base.BaseResponse;
import com.luvina.pos.provider.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app")
public class AuthController {

    private final AuthService authService;

    @Value("${app.version}")
    private String version;

    @GetMapping("/health-check")
    public Map<String, Object> health() {
        return Map.of(
                "status", "success",
                "version", version,
                "timestamp", Instant.now().toString()
        );
    }

    @PostMapping("/pos-token")
    public ResponseEntity<BaseResponse> login(@Valid @RequestBody AppUserDto appUserDto) {
        return ResponseEntity.ok(BaseResponse.builder().data(authService.login(appUserDto)).build());
    }

}
