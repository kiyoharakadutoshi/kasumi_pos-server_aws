package com.luvina.pos.provider.service;

import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.domain.transaction.LogMaster;
import com.luvina.pos.provider.domain.transaction.primarykey.LogMasterId;
import com.luvina.pos.provider.dto.app.LogChunkDto;
import com.luvina.pos.provider.dto.app.LogInfoDto;
import com.luvina.pos.provider.dto.app.PosInfoDto;
import com.luvina.pos.provider.mapper.LogMasterMapper;
import com.luvina.pos.provider.repository.transaction.LogMasterRepository;
import com.luvina.pos.provider.util.AuthUtil;
import com.luvina.pos.provider.util.ConvertUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.concurrent.ExecutorService;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogMasterService {
    private final LogMasterRepository logMasterRepository;
    private final LogMasterMapper logMasterMapper;
    @Value("${log.upload.dir}")
    private String uploadDir;
    private final ExecutorService logFileExecutor;
    @Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
    public boolean saveLog(LogInfoDto logInfoDto) {
        try {
            String token = logInfoDto.getHeaders().replaceAll(".*\"Bearer\\s+([^\"]+)\".*", "$1");
            PosInfoDto posInfoDto = AuthUtil.parsePosInfo(token);
            LogMasterId id = new LogMasterId();
            id.setCompanyCode(posInfoDto.getCompanyCode() != null ? posInfoDto.getCompanyCode() : CommonConstants.COMPANY_CODE_DEFAULT);
            id.setStoreCode(posInfoDto.getStoreCode() != null ? posInfoDto.getStoreCode() : CommonConstants.STORE_CODE_DEFAULT);
            id.setInstoreCode(posInfoDto.getInstoreCode() != null ? posInfoDto.getInstoreCode() : CommonConstants.INSTORE_CODE_DEFAULT);
            id.setRecordTimestamp(ConvertUtils.toLocalDateTime(logInfoDto.getRecordTimestamp()));
            LogMaster logMaster = logMasterMapper.toLogMaster(logInfoDto);
            logMaster.setId(id);
            logMasterRepository.save(logMaster);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean processChunk(LogChunkDto req) {
        byte[] bytes = Base64.getDecoder().decode(req.getData());
        String subFolder = String.format(
                "%s_%s_%s",
                req.getName().replace(" ", "_"),
                req.getMacAddress().replaceAll("[:\\-]", ""),
                req.getIpAddress()
        );
        logFileExecutor.submit(() -> {
            try {
                Path uploadPath = Paths.get(
                        uploadDir,
                        req.getCompanyCode(),
                        req.getStoreCode(),
                        req.getInstoreCode(),
                        subFolder
                );
                Files.createDirectories(uploadPath);

                Path filePath = uploadPath.resolve(req.getFileName());

                try (FileChannel channel = FileChannel.open(
                        filePath,
                        StandardOpenOption.CREATE,
                        StandardOpenOption.WRITE,
                        StandardOpenOption.APPEND)) {

                    channel.write(ByteBuffer.wrap(bytes));
                }
            } catch (Exception e) {
                log.error("Error writing log chunk", e);
            }
        });
        return true;
    }
}
