package com.pos.system.repository

import com.pos.system.model.db.CodeMaster
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CodeMasterRepository : JpaRepository<CodeMaster, String> {

}