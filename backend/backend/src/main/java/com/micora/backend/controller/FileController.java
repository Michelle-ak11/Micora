package com.micora.backend.controller;

import com.micora.backend.Repository.DesignFileRepo;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.DesignFile;
import com.micora.backend.model.User;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final DesignFileRepo fileRepo;
    private final UserRepo userRepo;
    private final SecureRandom random = new SecureRandom();

    public FileController(DesignFileRepo fileRepo, UserRepo userRepo) {
        this.fileRepo = fileRepo;
        this.userRepo = userRepo;
    }

    // Logged-in customers: upload a design
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(@RequestParam("file") MultipartFile file,
                                 Authentication authentication) throws IOException {
        Long userId = Long.parseLong(authentication.getName());
        User owner = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a file to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File is too big (max 5 MB)");
        }

        byte[] bytes = file.getBytes();
        String type = detectType(bytes);
        if (type == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Only PNG, JPG or PDF files are allowed");
        }

        String name = StringUtils.getFilename(StringUtils.cleanPath(
            file.getOriginalFilename() == null ? "design" : file.getOriginalFilename()));
        if (name == null || name.isBlank()) {
            name = "design";
        }
        if (name.length() > 200) {
            name = name.substring(name.length() - 200);
        }

        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        DesignFile saved = new DesignFile();
        saved.setToken(token);
        saved.setOwner(owner);
        saved.setFilename(name);
        saved.setContentType(type);
        saved.setSizeBytes((long) bytes.length);
        saved.setData(bytes);
        saved.setCreatedAt(LocalDateTime.now());
        fileRepo.save(saved);

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/files/").path(token).toUriString();

        return new UploadResponse(url, name, bytes.length);
    }

    // Public: view a file by its random link
    @GetMapping("/{token}")
    public ResponseEntity<byte[]> view(@PathVariable String token) {
        DesignFile f = fileRepo.findByToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(f.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.inline().filename(f.getFilename()).build().toString())
            .body(f.getData());
    }

    // Reads the first bytes of the file to confirm what it really is
    private String detectType(byte[] b) {
        if (b.length >= 4 && (b[0] & 0xFF) == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) {
            return "image/png";
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (b.length >= 4 && b[0] == 0x25 && b[1] == 0x50 && b[2] == 0x44 && b[3] == 0x46) {
            return "application/pdf";
        }
        return null;
    }

    public record UploadResponse(String url, String filename, long size) {}
}
