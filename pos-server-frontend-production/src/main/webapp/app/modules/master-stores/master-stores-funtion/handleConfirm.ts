/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { OperationType } from 'app/components/table/table-common';
import { MasterStoreSaveCondition } from '../master-stores-interface';
import { getListMasterStores, saveMasterStores } from 'app/services/master-stores-service';
import { addListMasterStores, handleClearSaveCondition } from 'app/reducers/master-stores-reducer';

export const handleConfirm = (masterStoresList, dispatch, masterStoreSearchCondition) => {
  const handleGetListMasterStores = () => {
    dispatch(getListMasterStores(masterStoreSearchCondition))
      .unwrap()
      .then((response) => {
        const dataStoreList = response.data?.data?.store_list?.map((item) => ({
          ...item,
          address: `${item?.address1 || ''}${item?.address2 || ''}${item?.address3 || ''}`,
        }));
        response.data?.data && dispatch(addListMasterStores(dataStoreList || []));
      })
      .catch(() => {});
  };
  const filteredAddStores: MasterStoreSaveCondition[] = masterStoresList.filter(
    (item) =>
      !(item?.operation_type === OperationType.Remove && item.operation_type_before === OperationType.New) &&
      (item.operation_type === OperationType.New ||
        item.operation_type === OperationType.Edit ||
        item.operation_type === OperationType.Remove)
  );
  if (filteredAddStores?.length > 0) {
    const dataAdd = filteredAddStores
      .filter((item) => item?.operation_type === OperationType.New)
      .map(({ address, ...rest }) => rest);
    const dataEdit = filteredAddStores
      .filter((item) => item?.operation_type === OperationType.Edit)
      .map(({ address, ...rest }) => rest);
    const dataDelete: any = filteredAddStores.filter(
      (item) => item?.operation_type === OperationType.Remove && item?.record_id
    );

    // handle add store
    if (dataAdd && dataAdd.length > 0) {
      const newData = {
        store_list: dataAdd,
      };
      dispatch(saveMasterStores(newData as any))
        .unwrap()
        .then(() => {
          handleGetListMasterStores();
        })
        .then(() => {
          dispatch(handleClearSaveCondition());
        })
        .catch(() => {});
    }
    // handle edit store
    if (dataEdit && dataEdit.length > 0) {
      const newData = {
        store_list: dataEdit,
      };
      dispatch(saveMasterStores(newData as any))
        .unwrap()
        .then(() => {
          handleGetListMasterStores();
        })
        .then(() => {
          dispatch(handleClearSaveCondition());
        })
        .catch(() => {});
    }
    // handle delete store
    if (dataDelete && dataDelete.length > 0) {
      const newData = {
        store_list: dataDelete,
      };
      dispatch(saveMasterStores(newData as any))
        .unwrap()
        .then(() => {
          handleGetListMasterStores();
        })
        .then(() => {
          dispatch(handleClearSaveCondition());
        })
        .catch((_) => {});
    } else {
      handleGetListMasterStores();
    }
  } else {
    handleGetListMasterStores();
  }
};
