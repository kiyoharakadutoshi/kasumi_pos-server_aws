package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.UpdateManager;
import com.luvina.pos.provider.domain.transaction.primarykey.UpdateManagerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpdateManagerRepository extends JpaRepository<UpdateManager, UpdateManagerId> {
}
