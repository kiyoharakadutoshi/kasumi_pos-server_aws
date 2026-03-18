package com.luvina.pos.provider.repository.custom;

import com.luvina.pos.provider.dto.app.JournalItemDto;
import com.luvina.pos.provider.dto.app.SearchJournalReqDto;
import com.luvina.pos.provider.util.AuthUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class JournalSearch {

    @PersistenceContext(unitName = "transaction")
    private EntityManager entityManager;

    public List<JournalItemDto> searchJournal(SearchJournalReqDto req, int offset, int limit, String employeeCode, String employeeName) {

        var posUser = AuthUtil.getCurrentUser();
        Integer storeCode = Integer.parseInt(posUser.getStoreCode());
        Integer companyCode = Integer.parseInt(posUser.getCompanyCode());
        LocalDate startDate = parseDate(req.getStartDate());
        LocalDate endDate = parseDate(req.getEndDate());
        LocalTime startTime = parseTime(req.getStartTime());
        LocalTime endTime = parseTime(req.getEndTime());
        StringBuilder sql = buildQuery(req, startDate, endDate, startTime, endTime);

        Query query = entityManager.createNativeQuery(sql.toString());
        setParameters(query, storeCode, companyCode, startDate, endDate, startTime, endTime, req);

        query.setFirstResult(offset);
        query.setMaxResults(limit);

        List<Object[]> rows = query.getResultList();
        List<JournalItemDto> items = new ArrayList<>();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

        for (Object[] r : rows) {
            Integer transactionType = r[0] == null ? null : ((Number) r[0]).intValue();
            String companyName = (String) r[1];
            Timestamp ts = (Timestamp) r[2];
            String transactionDate = ts == null ? null : ts.toLocalDateTime().format(dtf);
            String storeCodeResult = r[3] == null ? null : String.valueOf(r[3]);
            String storeName = (String) r[4];
            String storeTel = (String) r[5];
            String storeFax = (String) r[6];
            String instoreCode = (String) r[7];
            String receiptNo = r[8] == null ? null : String.valueOf(r[8]);
            String journalData = (String) r[9];
            String amount = (String) r[11];
            String prcname = (String) r[12];

            items.add(new JournalItemDto(
                    transactionType,
                    companyName,
                    transactionDate,
                    storeCodeResult,
                    storeName,
                    storeTel,
                    storeFax,
                    instoreCode,
                    receiptNo,
                    journalData,
                    employeeName,
                    employeeCode,
                    amount,
                    prcname
            ));
        }
        return items;
    }

    public long countJournal(SearchJournalReqDto req) {
        var posUser = AuthUtil.getCurrentUser();
        Integer storeCode = Integer.parseInt(posUser.getStoreCode());
        Integer companyCode = Integer.parseInt(posUser.getCompanyCode());
        LocalDate startDate = parseDate(req.getStartDate());
        LocalDate endDate = parseDate(req.getEndDate());
        LocalTime startTime = parseTime(req.getStartTime());
        LocalTime endTime = parseTime(req.getEndTime());

        StringBuilder fromWhere = buildQueryConditions(req, startDate, endDate, startTime, endTime, true);
        Query countQuery = entityManager.createNativeQuery("SELECT COUNT(*) " + fromWhere);
        setParameters(countQuery, storeCode, companyCode, startDate, endDate, startTime, endTime, req);
        return ((Number) countQuery.getSingleResult()).longValue();
    }

    private StringBuilder buildQuery(SearchJournalReqDto req,
                                     LocalDate startDate,
                                     LocalDate endDate,
                                     LocalTime startTime,
                                     LocalTime endTime) {
        return new StringBuilder("""
                SELECT
                    j.type,
                    c.company_name,
                    j.record_dt,
                    j.store_code,
                    s.ten_name,
                    s.tel_num,
                    s.fax_num,
                    j.instore_code,
                    j.prcno,
                    j.jrndata,
                    j.account_id,
                    j.amount,
                    j.prcname
                """).append(buildQueryConditions(req, startDate, endDate, startTime, endTime, false))
                .append("""
                 ORDER BY
                  j.record_id DESC
                """);
    }

    private static StringBuilder buildQueryConditions(SearchJournalReqDto req,
                                                      LocalDate startDate,
                                                      LocalDate endDate,
                                                      LocalTime startTime,
                                                      LocalTime endTime,
                                                      Boolean isCountJournals) {
        StringBuilder fromWhere = new StringBuilder();
        if (isCountJournals) {
            fromWhere.append("""
                    FROM  journals j
                    WHERE j.record_void_flag <> '1'
                      AND j.company_code = :companyCode
                      AND j.store_code = :storeCode
                    """);
        } else {
            fromWhere.append("""
                    FROM  journals j
                    JOIN `M_KSM`.companies c
                      ON c.company_code = j.company_code
                     AND c.record_void_flag <> '1'
                    JOIN `M_KSM`.stores s
                      ON s.company_code = j.company_code
                     AND s.store_code   = j.store_code
                     AND s.record_void_flag <> '1'
                    WHERE j.record_void_flag <> '1'
                      AND j.company_code = :companyCode
                      AND j.store_code = :storeCode
                    """);
        }

        // Filter by datetime
        if (startDate != null) {
            fromWhere.append(" AND j.record_dt >= :startDate");
        }
        if (endDate != null) {
            fromWhere.append(" AND j.record_dt <= :endDate");
        }

        // Filter by time
        if (startTime != null) {
            fromWhere.append(" AND j.record_time >= :startTime");
        }
        if (endTime != null) {
            fromWhere.append(" AND j.record_time <= :endTime");
        }

        // receipt_no range (prcno)
        if (req.getReceiptNoFrom() != null) {
            fromWhere.append(" AND j.prcno >= :receiptNoFrom");
        }
        if (req.getReceiptNoTo() != null) {
            fromWhere.append(" AND j.prcno <= :receiptNoTo");
        }
        return fromWhere;
    }

    private void setParameters(Query q,
                               Integer storeCode,
                               Integer companyCode,
                               LocalDate startDate,
                               LocalDate endDate,
                               LocalTime startTime,
                               LocalTime endTime,
                               SearchJournalReqDto req) {

        q.setParameter("companyCode", companyCode);
        q.setParameter("storeCode", storeCode);

        if (startDate != null) {
            LocalDateTime startDT = startDate.atStartOfDay();
            q.setParameter("startDate", Timestamp.valueOf(startDT));
        }

        if (endDate != null) {
            LocalDateTime endDT = endDate.atTime(23, 59, 59);
            q.setParameter("endDate", Timestamp.valueOf(endDT));
        }

        if (startTime != null) {
            q.setParameter("startTime", Time.valueOf(startTime));
        }
        if (endTime != null) {
            q.setParameter("endTime", Time.valueOf(endTime));
        }
        if (req.getReceiptNoFrom() != null) {
            q.setParameter("receiptNoFrom", req.getReceiptNoFrom());
        }
        if (req.getReceiptNoTo() != null) {
            q.setParameter("receiptNoTo", req.getReceiptNoTo());
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) {
            return null;
        }
        return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
}
