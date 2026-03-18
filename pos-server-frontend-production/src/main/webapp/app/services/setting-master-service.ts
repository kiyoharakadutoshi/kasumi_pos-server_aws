import {
  CashRegister,
  CashRegisterType,
  DataSearchCashMachine,
  ICashRegisterCodeDtos,
  IPresetCash
} from 'app/modules/setting-master/interface-setting';
import {
  getBlobWithMethodPost,
  getDataWithMethodPost,
  getDataWithParam,
  getDataWithPath,
  postData, postFile,
  ResponseApi
} from './base-service';

export interface ListCashRegisterTypeResponse extends ResponseApi {
  data: CashRegisterType[];
}

export interface CashRegisterResponse extends ResponseApi {
  data: CashRegister;
}

export interface PresetsCashResponse extends ResponseApi {
  data: IPresetCash;
}

export interface CashRegisterCodeListResponse extends ResponseApi {
  data: ICashRegisterCodeDtos;
}

export const paymentMachineLayouts = getDataWithParam<{ search_name?: string }, any>(`cash-register-type`)
export const postCashRegister = getDataWithMethodPost<{ cashRegister?: CashRegister[] }, any>(`cash-register-type/maintainance`)
export const getCashRegisterDetail = getDataWithPath<{ store_code: string; code: string }, CashRegisterResponse>('cash-registers/');
export const getCashRegisterType = getDataWithParam<{ type_name?: string }, ListCashRegisterTypeResponse>('cash-register-type')
export const getCashRegister = getDataWithParam<DataSearchCashMachine, any>('cash-registers');
export const validateCashRegister = getDataWithParam<DataSearchCashMachine, any>('cash-registers');
export const maintenance = postData<{cash_registers: CashRegister[]}>('cash-registers/maintainance')
export const importCSV = postFile<FormData>('cash-registers/import')
export const exportCSV = getBlobWithMethodPost<DataSearchCashMachine>('cash-registers/export')
export const getPresetsCashMachine = getDataWithParam<{selected_stores: string[]}, PresetsCashResponse>('cash-registers/presets')
export const getCashRegisterCodeList = getDataWithParam<{selected_stores: string[]}, CashRegisterCodeListResponse>('cash-registers/codes')
