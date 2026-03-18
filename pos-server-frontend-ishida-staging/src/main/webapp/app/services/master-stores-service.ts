import {
  IDataMasterStoresResponse,
  IPaymentMethod,
  MasterStoreExportCsvCondition,
  IMasterStoreSearchCondition,
  MasterStoreSaveConditionParam,
} from 'app/modules/master-stores/master-stores-interface';
import { getBlobWithMethodPost, getDataWithMethodPost, getDataWithParam, postData } from './base-service';

export const getListMasterStores = getDataWithParam<IMasterStoreSearchCondition, IDataMasterStoresResponse>(`stores`);

export const isMasterStoreExisted = getDataWithParam<{ store_code: string }, any>(`stores/check-exist`);

export const saveMasterStores = postData<MasterStoreSaveConditionParam>(`stores/maintenance`);

export const isDeletable = getDataWithParam<{ selectedStore: string }, any>(`stores/deletable`);

export const postExportingMasterStoreCsv = getBlobWithMethodPost<MasterStoreExportCsvCondition>('stores/export');

export const getCodeMasterPayment = getDataWithMethodPost<
  { master_code: string },
  { data: { items: IPaymentMethod[] } }
>('code-master/stores-payment');
