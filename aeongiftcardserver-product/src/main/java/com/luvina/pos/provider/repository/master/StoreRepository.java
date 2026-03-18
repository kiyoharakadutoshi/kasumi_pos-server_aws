package com.luvina.pos.provider.repository.master;

import com.luvina.pos.provider.domain.master.Store;
import com.luvina.pos.provider.domain.master.primarykey.StoreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, StoreId> {
}
