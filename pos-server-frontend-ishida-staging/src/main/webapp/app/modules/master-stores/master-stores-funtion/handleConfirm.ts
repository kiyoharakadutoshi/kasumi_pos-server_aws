import { MasterStoreSaveCondition, MasterStoreSaveConditionParam } from '../master-stores-interface';
import { getListMasterStores, saveMasterStores } from '@/services/master-stores-service';
import {
  addListMasterStores,
  addListMasterStoresDefault,
  handleClearSaveCondition,
} from '@/reducers/master-stores-reducer';

export const handleConfirm = (masterStoresList, dispatch, masterStoreSearchCondition) => {
  const handleGetListMasterStores = () => {
    dispatch(getListMasterStores({ ...masterStoreSearchCondition, code: masterStoreSearchCondition.code }))
      .unwrap()
      .then((response) => {
        const dataStoreList = response.data?.data?.store_list?.map((item) => ({
          ...item,
          address: `${item?.address1 || ''}${item?.address2 || ''}${item?.address3 || ''}`,
        }));
        response.data?.data && dispatch(addListMasterStores(dataStoreList || []));
        response.data?.data && dispatch(addListMasterStoresDefault(dataStoreList || []));
      })
      .catch(() => {});
  };
  const maintainedStores: MasterStoreSaveCondition[] = masterStoresList
    .filter((item) => item.operation_type)
    .map((item) => ({ ...item }));

  if (maintainedStores?.length > 0) {
    const newData: MasterStoreSaveConditionParam = {
      store_list: maintainedStores,
    };

    dispatch(saveMasterStores(newData))
      .unwrap()
      .then(() => {
        handleGetListMasterStores();
      })
      .then(() => {
        dispatch(handleClearSaveCondition());
      })
      .catch(() => {});
  }
};
