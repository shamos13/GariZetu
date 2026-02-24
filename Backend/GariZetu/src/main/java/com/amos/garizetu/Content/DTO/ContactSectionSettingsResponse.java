package com.amos.garizetu.Content.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactSectionSettingsResponse {
    private String phone;
    private String altPhone;
    private String email;
    private String supportEmail;
    private String whatsapp;
    private String address;
    private String city;
    private String hours;
    private String sundayHours;
    private String jkiaDeskHours;
    private String heroTitle;
    private String heroDescription;
}
