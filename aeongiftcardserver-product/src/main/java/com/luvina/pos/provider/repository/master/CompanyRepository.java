package com.luvina.pos.provider.repository.master;

import com.luvina.pos.provider.domain.master.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
}
