package com.pdf.backend.repository;

import com.pdf.backend.model.PdfOperationHistory;
import com.pdf.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PdfOperationHistoryRepository extends JpaRepository<PdfOperationHistory, Long> {
    
    Page<PdfOperationHistory> findAllByOrderByTimestampDesc(Pageable pageable);
    
    List<PdfOperationHistory> findByUserOrderByTimestampDesc(User user);
    
    List<PdfOperationHistory> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT DISTINCT h.operationType FROM PdfOperationHistory h")
    List<String> findDistinctOperationTypes();
    
    @Query("SELECT DISTINCT h.country FROM PdfOperationHistory h WHERE h.country IS NOT NULL")
    List<String> findDistinctCountries();
}