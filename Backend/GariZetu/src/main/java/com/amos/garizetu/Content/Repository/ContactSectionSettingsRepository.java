package com.amos.garizetu.Content.Repository;

import com.amos.garizetu.Content.Entity.ContactSectionSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactSectionSettingsRepository extends JpaRepository<ContactSectionSettings, Long> {
    Optional<ContactSectionSettings> findTopByOrderBySettingsIdAsc();
}
