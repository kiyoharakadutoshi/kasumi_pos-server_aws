package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.LogMaster;
import com.luvina.pos.provider.domain.transaction.primarykey.LogMasterId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogMasterRepository extends JpaRepository<LogMaster, LogMasterId> {
}
