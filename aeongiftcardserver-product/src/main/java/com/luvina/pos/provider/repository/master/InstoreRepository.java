package com.luvina.pos.provider.repository.master;

import com.luvina.pos.provider.domain.master.Instore;
import com.luvina.pos.provider.domain.master.primarykey.InstoreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InstoreRepository extends JpaRepository<Instore, InstoreId> {

    @Query("""
            SELECT i
            FROM Instore i
            WHERE i.id.instoreCode = :instoreCode
              AND i.id.storeCode   = :storeCode
              AND i.id.companyCode = :companyCode
            """)
    Instore getSettingDevice(
            @Param("instoreCode") String instoreCode,
            @Param("storeCode") Integer storeCode,
            @Param("companyCode") Integer companyCode
    );
}
