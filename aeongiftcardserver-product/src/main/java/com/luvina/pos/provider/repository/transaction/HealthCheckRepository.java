package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.MachineStatusHistory;
import com.luvina.pos.provider.domain.transaction.primarykey.MachineStatusId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthCheckRepository extends JpaRepository<MachineStatusHistory, MachineStatusId> {
}
