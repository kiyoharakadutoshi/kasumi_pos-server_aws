package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.SettlementHistory;
import com.luvina.pos.provider.domain.transaction.primarykey.SettlementHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SettlementHistoryRepository extends JpaRepository<SettlementHistory, SettlementHistoryId> {

    @Query(value = """
            select max(output_datetime)
            from settlement_history
            where
            company_code = :companyCode
            and record_void_flag <> '1'
            and status <> 1
            """, nativeQuery = true)
    LocalDateTime getLastSettlementTime(Integer companyCode);

}
