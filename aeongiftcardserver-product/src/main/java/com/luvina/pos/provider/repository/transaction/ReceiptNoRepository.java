package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.ReceiptNoManager;
import com.luvina.pos.provider.domain.transaction.primarykey.ReceiptNoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptNoRepository extends JpaRepository<ReceiptNoManager, ReceiptNoId> {
}
