package com.chefsbrain.scheduling_engine.controller;

import com.chefsbrain.scheduling_engine.model.Workspace;
import com.chefsbrain.scheduling_engine.repository.WorkspaceRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkspaceController {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/create")
    public ResponseEntity<?> createWorkspace(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String adminEmail = payload.get("adminEmail");
        String adminPassword = payload.get("adminPassword");
        String invites = payload.get("invites");

        // Generate a random 6-character alphanumeric password
        String randomPassword = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // 1. Save to H2 Database
        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setAdminEmail(adminEmail);
        workspace.setAdminPassword(adminPassword);
        workspace.setPassword(randomPassword);
        workspaceRepository.save(workspace);

        // 2. Send Invitation Emails
        if (invites != null && !invites.trim().isEmpty()) {
            String[] emailArray = invites.split(",");
            for (String email : emailArray) {
                sendInviteEmail(email.trim(), name, adminEmail, randomPassword);
            }
        }

        // Return the generated password to the frontend so the admin is logged in immediately
        return ResponseEntity.ok().body(Map.of("message", "Workspace created!", "password", randomPassword, "workspaceId", String.valueOf(workspace.getId())));
    }

    // New Endpoint to verify admin password
    @PostMapping("/verify-admin")
    public ResponseEntity<?> verifyAdmin(@RequestBody Map<String, String> payload) {
        String password = payload.get("password");
        // Extract the workspaceId sent from the frontend
        String workspaceIdStr = payload.get("workspaceId");

        if (workspaceIdStr == null || workspaceIdStr.isEmpty()) {
             return ResponseEntity.badRequest().body(Map.of("message", "Workspace ID is required"));
        }

        try {
            Long workspaceId = Long.parseLong(workspaceIdStr);
            // Fetch only the specific workspace the user is trying to access
            Workspace workspace = workspaceRepository.findById(workspaceId).orElse(null);

            if (workspace != null && workspace.getAdminPassword() != null && workspace.getAdminPassword().equals(password)) {
                 // Return the raw boolean true that the frontend expects
                 return ResponseEntity.ok().body(true);
            }
        } catch (NumberFormatException e) {
             return ResponseEntity.badRequest().body(Map.of("message", "Invalid Workspace ID format"));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid admin password"));
    }

    // New Endpoint to verify invited staff passwords
    @PostMapping("/verify")
    public ResponseEntity<?> verifyWorkspace(@RequestBody Map<String, String> payload) {
        String password = payload.get("password");

        for (Workspace w : workspaceRepository.findAll()) {
            if (w.getPassword() != null && w.getPassword().equals(password)) {
                return ResponseEntity.ok().body(Map.of(
                        "message", "Success",
                        "kitchenName", w.getName(),
                        "workspaceId", String.valueOf(w.getId())
                         ));
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
    }

    private void sendInviteEmail(String to, String workspaceName, String adminEmail, String pwd) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("🔥 You're invited to join " + workspaceName + " on Chef's Brain!");

            String loginUrl = "http://localhost:5173";

            String htmlContent = "<div style=\"background-color: #f3f4f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\">\n" +
                    "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;\">\n" +
                    "    <img src=\"https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop\" alt=\"Professional Kitchen\" style=\"width: 100%; height: 220px; object-fit: cover; display: block;\" />\n" +
                    "    <div style=\"padding: 40px 30px;\">\n" +
                    "      <div style=\"text-align: center; margin-bottom: 30px;\">\n" +
                    "        <h1 style=\"color: #f97316; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;\">👨‍🍳 Chef's Brain</h1>\n" +
                    "        <p style=\"color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px; font-weight: bold;\">Kitchen Scheduling Engine</p>\n" +
                    "      </div>\n" +
                    "      <div style=\"background-color: #fff7ed; padding: 30px; border-radius: 12px; border-left: 4px solid #f97316;\">\n" +
                    "        <h2 style=\"color: #111827; margin-top: 0; font-size: 22px;\">You're Invited! 🎉</h2>\n" +
                    "        <p style=\"color: #374151; line-height: 1.7; font-size: 16px;\">\n" +
                    "          <strong>" + adminEmail + "</strong> has invited you to join the <span style=\"color: #f97316; font-weight: bold;\">" + workspaceName + "</span> workspace.\n" +
                    "        </p>\n" +
                    "        <div style=\"background-color: #ffffff; padding: 20px; border-radius: 12px; border: 2px dashed #fdba74; margin: 25px 0; text-align: center;\">\n" +
                    "          <p style=\"color: #9a3412; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; margin-top: 0;\">Your Entry Password</p>\n" +
                    "          <h2 style=\"color: #ea580c; margin: 0; font-size: 34px; letter-spacing: 8px; font-family: monospace;\">" + pwd + "</h2>\n" +
                    "        </div>\n" +
                    "        <div style=\"text-align: center; margin-top: 25px; margin-bottom: 10px;\">\n" +
                    "          <a href=\"" + loginUrl + "\" style=\"background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; display: inline-block; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);\">\n" +
                    "            🚀 Enter Kitchen Space\n" +
                    "          </a>\n" +
                    "        </div>\n" +
                    "      </div>\n" +
                    "      <div style=\"text-align: center; margin-top: 35px; border-top: 1px solid #e5e7eb; padding-top: 20px;\">\n" +
                    "        <p style=\"color: #9ca3af; font-size: 12px; line-height: 1.5;\">\n" +
                    "          This is an automated invitation from the Chef's Brain system.<br/>\n" +
                    "          If you don't know who sent this, you can safely ignore it.\n" +
                    "        </p>\n" +
                    "      </div>\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}