package com.luvina.pos.provider.repository.master;

import com.luvina.pos.provider.domain.master.Employee;
import com.luvina.pos.provider.domain.master.Instore;
import com.luvina.pos.provider.domain.master.primarykey.EmployeeId;
import com.luvina.pos.provider.domain.master.primarykey.InstoreId;
import com.luvina.pos.provider.util.AuthUtil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, EmployeeId> {
    Optional<Employee> findByIdEmployeeCode(String employeeCode);

    @Query(value = """
        SELECT e.name
        FROM employees e
        WHERE e.employee_code = '9999'
          AND e.company_code  = :companyCode
          AND e.store_code    = :storeCode
        """, nativeQuery = true)
    String findEmployeeName(
            @Param("companyCode") String companyCode,
            @Param("storeCode") String storeCode
    );
}
