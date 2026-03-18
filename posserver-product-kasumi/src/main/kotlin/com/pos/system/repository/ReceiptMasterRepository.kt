package com.pos.system.repository

import com.pos.system.model.db.ReceiptMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ReceiptMasterRepository : JpaRepository<ReceiptMaster, Long> {
    @Query(value = "SELECT COUNT(*) FROM receiptmaster s " +
            "WHERE s.RECORD_VOID_FLAG <> '1' AND s.CompanyCode = ?1 AND s.StoreCode = ?2 AND s.InstoreCode = ?10 " +
            "AND (s.ReceiptCreateDate BETWEEN IF(?3 = '', '0000-01-01', ?3) AND IF(?4 = '', CURRENT_DATE, ?4)) " +
            "AND (s.ReceiptCreateTime BETWEEN IF(?5 = '', '00:00:00', ?5) AND IF(?6 = '', '24:00:00', ?6)) " +
            "AND (s.ReceiptNo BETWEEN IF(?7 = '', 0, convert(?7, signed)) AND IF(?8 = '', 99999, convert(?8, signed))) " +
            "AND (IF(?9 = '', true, s.EmployeeCode = ?9))", nativeQuery = true)
    fun countReceipt(companyCode: String,
                     storeCode: String,
                     startDate: String,
                     endDate: String,
                     startTime: String,
                     endTime: String,
                     startReceiptNo: String,
                     endReceiptNo: String,
                     employeeCode: String,
                     inStoreCode: String): Int?

    @Query(value = "SELECT * FROM receiptmaster s " +
            "WHERE s.RECORD_VOID_FLAG <> '1' AND s.CompanyCode = ?1 AND s.StoreCode = ?2 AND s.InstoreCode = ?12 " +
            "AND (s.ReceiptCreateDate BETWEEN IF(?3 = '', '0000-01-01', ?3) AND IF(?4 = '', CURRENT_DATE, ?4)) " +
            "AND (s.ReceiptCreateTime BETWEEN IF(?5 = '', '00:00:00', ?5) AND IF(?6 = '', '24:00:00', ?6)) " +
            "AND (s.ReceiptNo BETWEEN IF(?7 = '', 0, convert(?7, signed)) AND IF(?8 = '', 99999, convert(?8, signed))) " +
            "AND (IF(?9 = '', true, s.EmployeeCode = ?9)) " +
            "ORDER BY s.ReceiptCreateDate DESC, s.ReceiptCreateTime DESC, s.ReceiptNo DESC " +
            "LIMIT ?10 OFFSET ?11", nativeQuery = true)
    fun findReceiptMaster(companyCode: String,
                          storeCode: String,
                          startDate: String,
                          endDate: String,
                          startTime: String,
                          endTime: String,
                          startReceiptNo: String,
                          endReceiptNo: String,
                          employeeCode: String,
                          limit: Int,
                          offset: Int,
                          inStoreCode: String): List<ReceiptMaster>?
}