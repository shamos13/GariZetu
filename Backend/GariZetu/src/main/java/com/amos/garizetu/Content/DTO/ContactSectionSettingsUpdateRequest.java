package com.amos.garizetu.Content.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactSectionSettingsUpdateRequest {

    @Size(max = 40, message = "Phone cannot exceed 40 characters")
    private String phone;

    @Size(max = 40, message = "Alternative phone cannot exceed 40 characters")
    private String altPhone;

    @Email(message = "Please provide a valid email address")
    @Size(max = 120, message = "Email cannot exceed 120 characters")
    private String email;

    @Email(message = "Please provide a valid support email")
    @Size(max = 120, message = "Support email cannot exceed 120 characters")
    private String supportEmail;

    @Size(max = 40, message = "WhatsApp cannot exceed 40 characters")
    private String whatsapp;

    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    @Size(max = 120, message = "City cannot exceed 120 characters")
    private String city;

    @Size(max = 80, message = "Hours cannot exceed 80 characters")
    private String hours;

    @Size(max = 80, message = "Sunday hours cannot exceed 80 characters")
    private String sundayHours;

    @Size(max = 80, message = "JKIA desk hours cannot exceed 80 characters")
    private String jkiaDeskHours;

    @Size(max = 80, message = "Hero title cannot exceed 80 characters")
    private String heroTitle;

    @Size(max = 300, message = "Hero description cannot exceed 300 characters")
    private String heroDescription;
}
