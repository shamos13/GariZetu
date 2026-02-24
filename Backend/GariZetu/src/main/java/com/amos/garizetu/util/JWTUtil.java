package com.amos.garizetu.util;

import com.amos.garizetu.config.JWTConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Slf4j
public class JWTUtil {

    private final JWTConfig jwtConfig;

    /*
    * Generates a Token for the user
    *
    * This is called after the password is verified
    * @param email: user's email is used as the subject of the token
    *
    * The token Structure:
    * - Header: Algorithm info
    * - Payload: User data (email, role, issued time, expiration)
    * - Signature: Cryptographic signature using the secret key
    * */

    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role); //Add role to the token
        return createToken(claims, email);
    }

    // Method that creates the actual token
    //@param claims - Additional data to include in the token (like role)
    //@param subject - The main identifier (email in our case)
    //@return The complete JWT token string
    private String createToken(Map<String, Object> claims, String subject){
        Date now= new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());
        return Jwts.builder()
                .claims(claims)         //Adds additional data(role)
                .subject(subject)       //Sets the subject(email)
                .issuedAt(now)          //When token was created
                .expiration(expiryDate) //When token expires
                .signWith(getSigningKey()) //Sign with our secret key
                .compact();             //Build the final token string
    }

    //Extracting the email
    public String extractEmail(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmailAllowExpired(String token) {
        return extractClaimAllowExpired(token, Claims::getSubject);
    }

    //Extracting the role
    public String extractRole(String token){
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractRoleAllowExpired(String token) {
        return extractClaimAllowExpired(token, claims -> claims.get("role", String.class));
    }

    //Extracting the Expiration date
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public <T> T extractClaimAllowExpired(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaimsAllowExpired(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // Verify signature with our secret
                .build()
                .parseSignedClaims(token)     // Parse and verify the token
                .getPayload();                 // Get the payload (claims)
    }

    private Claims extractAllClaimsAllowExpired(String token) {
        try {
            return extractAllClaims(token);
        } catch (ExpiredJwtException expiredJwtException) {
            return expiredJwtException.getClaims();
        }
    }

    public boolean isRefreshAllowed(String token, long refreshGraceMs) {
        try {
            extractAllClaims(token);
            return true;
        } catch (ExpiredJwtException expiredJwtException) {
            Date expiration = expiredJwtException.getClaims().getExpiration();
            if (expiration == null) {
                return false;
            }
            long nowMillis = System.currentTimeMillis();
            long graceMillis = Math.max(0L, refreshGraceMs);
            return expiration.getTime() + graceMillis > nowMillis;
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            // Parse once; this validates signature and expiration in one step.
            extractAllClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    //This converts our secret String into a cryptographic key
    // that can be used to sign and verify tokens
    private SecretKey getSigningKey(){
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
