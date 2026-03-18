package com.pos.system.repository
import com.pos.system.model.db.EmployeeExmvkMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EmployeeExmvkMasterRepository : JpaRepository<EmployeeExmvkMaster, Long>, EmployeeExmvkMasterRepositoryCustom {
    fun findFirstByEmployeeCode(employeeCode: String): EmployeeExmvkMaster?
}