package com.amos.garizetu.Content.Repository;

import com.amos.garizetu.Content.Entity.BrandLogoOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandLogoOverrideRepository extends JpaRepository<BrandLogoOverride, Long> {
    Optional<BrandLogoOverride> findByBrandKey(String brandKey);

    List<BrandLogoOverride> findAllByOrderByBrandNameAsc();
}
