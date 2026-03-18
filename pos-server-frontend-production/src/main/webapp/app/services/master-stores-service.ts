import {
  IDataMasterStoresResponse,
  IMasterStoresResponse,
  MasterStoreSaveCondition,
  MasterStoreSearchCondition,
} from "app/modules/master-stores/master-stores-interface";
import { getDataWithParam, postData } from "./base-service";

export const getListMasterStores = getDataWithParam<
  MasterStoreSearchCondition,
  IDataMasterStoresResponse
>(`stores`);

export const isMasterStoreExisted = getDataWithParam<
  { store_code: string },
  any
>(`stores/check-exist`);

export const saveMasterStores =
  postData<MasterStoreSaveCondition>(`stores/maintenance`);

export const isDeletable = getDataWithParam<{ selectedStore: string }, any>(
  `stores/deletable`
);
