package com.luvina.pos.provider.repository.transaction;

import com.luvina.pos.provider.domain.transaction.Journal;
import com.luvina.pos.provider.domain.transaction.primarykey.JournalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalRepository extends JpaRepository<Journal, JournalId> {
}
