package com.pos.system.repository
import com.pos.system.model.db.ChargeInfo
import com.pos.system.model.db.ChargerReceiptNo
import com.pos.system.model.db.ClassType
import jakarta.persistence.Tuple
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
interface ChargeInfoRepository : JpaRepository<ChargeInfo, Long> {

    @Query(value = "SELECT IFNULL(SUM(amount), 0) FROM charge_info WHERE CompanyCode = ?1 AND StoreCode = ?2 " +
            "AND InstoreCode = ?3 AND (Class = '1' or Class = '2' or Class = '4') AND RECORD_VOID_FLAG <> '1' AND InspectionDatetime IS NULL", nativeQuery = true)
    fun totalReserveMoney(companyCode: String, storeCode: String, instoreCode: String) : Int

    @Query(value = "SELECT IFNULL(SUM(amount), 0) FROM charge_info WHERE CompanyCode = :companyCode AND StoreCode = :storeCode " +
            "AND InstoreCode = :instoreCode AND RECORD_VOID_FLAG <> '1' AND Class = :#{#classType.value} AND InspectionDatetime IS NULL", nativeQuery = true)
    fun totalMoneyByScreen(@Param("companyCode") companyCode: String,
                           @Param("storeCode") storeCode: String,
                           @Param("instoreCode") instoreCode: String,
                           @Param("classType") classType: ClassType) : Int

    @Query(value = "SELECT Class, Count(*) as Count, Sum(Amount) as Amount FROM charge_info WHERE CompanyCode = ?1 AND StoreCode = ?2 " +
            "AND InstoreCode = ?3 AND RECORD_VOID_FLAG <> '1' AND InspectionDatetime IS NULL GROUP BY CompanyCode, StoreCode, InstoreCode, Class", nativeQuery = true)
    fun totalAll(companyCode: String, storeCode: String, instoreCode: String) : List<Tuple>

    @Query(value = "SELECT MAX(InspectionDatetime) FROM charge_info where CompanyCode = ?1 AND StoreCode = ?2 AND InstoreCode = ?3 AND class = 4 AND RECORD_VOID_FLAG <> '1' AND InspectionDatetime IS NOT NULL", nativeQuery = true)
    fun findLastExport(companyCode: String, storeCode: String, instoreCode: String) : Timestamp?

    @Modifying
    @Query(value = "UPDATE charge_info SET InspectionDatetime = NOW() WHERE CompanyCode = ?1 AND StoreCode = ?2 " +
            "AND InstoreCode = ?3 AND InspectionDatetime IS NULL", nativeQuery = true)
    fun updateApplyDateTime(companyCode: String, storeCode: String, instoreCode: String) : Int
}

@Repository
interface ChargerReceiptNoRepository : JpaRepository<ChargerReceiptNo, Long> {
    @Query(value = "SELECT * FROM charge_receipt_no WHERE CompanyCode = ?1 AND StoreCode = ?2 " +
            "AND InstoreCode = ?3", nativeQuery = true)
    fun findReceiptNo(companyCode: String, storeCode: String, instoreCode: String) : ChargerReceiptNo?
}