package com.luvina.pos.provider.service;


import com.luvina.pos.provider.domain.master.Instore;
import com.luvina.pos.provider.domain.master.Store;
import com.luvina.pos.provider.domain.master.primarykey.StoreId;
import com.luvina.pos.provider.domain.transaction.ReceiptNoManager;
import com.luvina.pos.provider.domain.transaction.primarykey.ReceiptNoId;
import com.luvina.pos.provider.dto.app.SettingDeviceGetReqDto;
import com.luvina.pos.provider.dto.app.SettingDeviceGetResDto;
import com.luvina.pos.provider.exception.NotFoundException;
import com.luvina.pos.provider.repository.master.InstoreRepository;
import com.luvina.pos.provider.repository.master.StoreRepository;
import com.luvina.pos.provider.repository.transaction.ReceiptNoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.luvina.pos.provider.constant.CommonConstants.EMPLOYEE_CODE_DEFAULT;
import static com.luvina.pos.provider.constant.MessageConstant.MSG001E;

@Service
@RequiredArgsConstructor
public class SettingDeviceService {
    private final InstoreRepository instoreRepository;
    private final StoreRepository storeRepository;
    private final EmployeeService employeeService;
    private final ReceiptNoRepository receiptNoRepository;
    private final String AEON_CODE = "6310";

    public SettingDeviceGetResDto getSettingDevice(SettingDeviceGetReqDto reqDto) {
        String receiptNo = "0";
        String storeName = null;
        String tel = null;
        Integer storeCode = Integer.valueOf(reqDto.getStoreCode());
        Integer companyCode = Integer.valueOf(reqDto.getCompanyCode());
        Instore instore = instoreRepository.getSettingDevice(
                reqDto.getInstoreCode(), storeCode, companyCode);
        Store store = storeRepository.findById(new StoreId(companyCode, storeCode)).orElse(null);
        ReceiptNoManager receiptNoManager = receiptNoRepository.findById(
                new ReceiptNoId(companyCode, storeCode, reqDto.getInstoreCode())).orElse(null);
        if (instore == null) {
            throw new NotFoundException(MSG001E);
        }
        if (store != null) {
            storeName = store.getTenName();
            tel = store.getTelNum();
        }
        if (receiptNoManager != null) {
            receiptNo = receiptNoManager.getPrcno();
        }
        String nameEmployee = employeeService.getEmployeeName();
        return new SettingDeviceGetResDto(
                reqDto.getCompanyCode(),
                reqDto.getStoreCode(),
                reqDto.getInstoreCode(),
                instore.getDeviceClassCode(),
                EMPLOYEE_CODE_DEFAULT,
                nameEmployee,
                receiptNo,
                storeName,
                tel,
                AEON_CODE
        );
    }
}
