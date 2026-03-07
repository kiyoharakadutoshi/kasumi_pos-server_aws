package com.pos.system.repository

import com.pos.system.model.dto.LogMasterDTO

interface LogMasterRepositoryCustom {
    fun chooseReceipt(recordID: Long): LogMasterDTO?
}