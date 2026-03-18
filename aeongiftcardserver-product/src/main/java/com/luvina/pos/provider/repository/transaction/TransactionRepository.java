package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.Transaction;
import com.luvina.pos.provider.domain.transaction.primarykey.TransactionId;
import com.luvina.pos.provider.dto.app.TransactionSummaryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, TransactionId> {

    default TransactionSummaryDto summarySettlement(
            Integer companyCode,
            Integer storeCode,
            String instoreCode,
            LocalDateTime start,
            LocalDateTime end
    ){
        List<Object[]> objects = summaryByCondition(companyCode, storeCode, instoreCode, start, end);
        if(CollectionUtils.isEmpty(objects)){
            return new TransactionSummaryDto(0L, 0L, 0L, 0L);
        }
        Object[] object = objects.get(0);
        return new TransactionSummaryDto((Long) object[0], (Long) object[1], (Long) object[2], (Long) object[3]);
    }

    @Query("""
        SELECT
            SUM(CASE WHEN t.type = 0 THEN 1 ELSE 0 END),
            COALESCE(SUM(CASE WHEN t.type = 0 THEN t.amount ELSE 0 END), 0),
            SUM(CASE WHEN t.type = 1 THEN 1 ELSE 0 END),
            COALESCE(SUM(CASE WHEN t.type = 1 THEN t.amount ELSE 0 END), 0)
        FROM Transaction t
        WHERE t.id.companyCode = :companyCode
          AND t.id.storeCode = :storeCode
          AND t.id.instoreCode = :instoreCode
          AND t.id.transactionDt >= :start
          AND t.id.transactionDt <= :end
    """)
    List<Object[]> summaryByCondition(
            @Param("companyCode") Integer companyCode,
            @Param("storeCode") Integer storeCode,
            @Param("instoreCode") String instoreCode,
            @Param("start")  LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
