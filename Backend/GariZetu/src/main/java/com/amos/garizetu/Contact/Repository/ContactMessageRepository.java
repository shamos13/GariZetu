package com.amos.garizetu.Contact.Repository;

import com.amos.garizetu.Contact.Entity.ContactMessage;
import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    @EntityGraph(attributePaths = {"replies"})
    @Query("SELECT DISTINCT m FROM ContactMessage m ORDER BY m.createdAt DESC")
    List<ContactMessage> findAllWithRepliesOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"replies"})
    @Query("SELECT DISTINCT m FROM ContactMessage m WHERE m.messageStatus = :status ORDER BY m.createdAt DESC")
    List<ContactMessage> findAllByStatusWithRepliesOrderByCreatedAtDesc(@Param("status") ContactMessageStatus status);

    @EntityGraph(attributePaths = {"replies"})
    @Query("SELECT m FROM ContactMessage m WHERE m.messageId = :messageId")
    Optional<ContactMessage> findByIdWithReplies(@Param("messageId") Long messageId);
}
