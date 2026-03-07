package com.luvina.pos.provider.service;

import com.luvina.pos.provider.constant.CommonConstants;
import com.luvina.pos.provider.domain.transaction.primarykey.UpdateManagerId;
import com.luvina.pos.provider.dto.app.AppUserDto;
import com.luvina.pos.provider.dto.app.InfoUpdateRequest;
import com.luvina.pos.provider.dto.app.InfoUpdateResponse;
import com.luvina.pos.provider.repository.transaction.UpdateManagerRepository;
import com.luvina.pos.provider.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
public class UpdateAppService {
    private final S3Service s3Service;
    private final UpdateManagerRepository updateManagerRepository;
    public InfoUpdateResponse getInfoUpdateResponse(InfoUpdateRequest infoUpdateRequest) {
        InfoUpdateResponse infoUpdateResponse = new InfoUpdateResponse();
        List<String> listFile = s3Service.listFiles(CommonConstants.URL_FOLDER_APP);
        var latest = findLatestVersion(listFile);
        if (listFile.isEmpty() || infoUpdateRequest.getAppVersion().compareTo(latest.getValue()) >= 0 ) {
            infoUpdateResponse.setStatus(1);
        } else  {
            var result = canUpdate();
            boolean canUpdate = result.getFirst();
            UpdateManagerId id = result.getSecond();
            if (canUpdate) {
                infoUpdateResponse.setStatus(0);
                infoUpdateResponse.setFileName(latest.getKey());
                infoUpdateResponse.setCompanyCode(id.getCompanyCode());
                infoUpdateResponse.setStoreCode(id.getStoreCode());
                infoUpdateResponse.setInstoreCode(id.getInstoreCode());
            } else {
                infoUpdateResponse.setStatus(2);
            }
        }
        return infoUpdateResponse;
    }

    public String getUrlDownload(String stringPath, long expireMinutes) {
        return s3Service.generatePresignedUrl(stringPath, expireMinutes);
    }

    private Pair<Boolean, UpdateManagerId> canUpdate() {
        AppUserDto user = AuthUtil.getCurrentUser();
        String companyCode = user != null ? user.getCompanyCode() : CommonConstants.COMPANY_CODE_DEFAULT;
        String storeCode = user != null ? user.getStoreCode() : CommonConstants.STORE_CODE_DEFAULT;
        String instoreCode = user != null ? user.getInstoreCode() : CommonConstants.INSTORE_CODE_DEFAULT;
        var result = checkUpdate(new UpdateManagerId(companyCode, storeCode, instoreCode));
        if (result.getFirst()) {
            return result;
        }
        if (!CommonConstants.INSTORE_CODE_DEFAULT.equals(instoreCode)) {
            instoreCode = CommonConstants.INSTORE_CODE_DEFAULT;
            result = checkUpdate(new UpdateManagerId(companyCode, storeCode, instoreCode));
            if (result.getFirst()) {
                return result;
            }
        }
        if (!CommonConstants.STORE_CODE_DEFAULT.equals(storeCode)) {
            storeCode = CommonConstants.STORE_CODE_DEFAULT;
            result = checkUpdate(new UpdateManagerId(companyCode, storeCode, instoreCode));

        }
        return result;
    }

    private Pair<Boolean, UpdateManagerId> checkUpdate(UpdateManagerId updateManagerId) {
        boolean canUpdate = updateManagerRepository.findById(updateManagerId)
                .map(data -> CommonConstants.CAN_UPDATE_FLAG.equals(data.getUpdateFlag()))
                .orElse(false);

        return Pair.of(canUpdate, updateManagerId);
    }

    private static Map.Entry<String, String> findLatestVersion(List<String> files) {

        return files.stream()
                .collect(Collectors.toMap(
                        f -> f,
                        f -> f.replace(CommonConstants.START_FILE_NAME, CommonConstants.BLANK)
                                .replace(CommonConstants.END_FILE_ZIP, CommonConstants.BLANK)
                                .replace(CommonConstants.END_FILE_MSI, CommonConstants.BLANK)
                ))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
    }
}
