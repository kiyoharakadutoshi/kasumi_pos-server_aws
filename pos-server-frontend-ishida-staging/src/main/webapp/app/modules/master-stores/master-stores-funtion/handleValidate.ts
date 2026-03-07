/* eslint-disable no-dupe-else-if */
import { IMasterStoreRecord, MasterStoreSaveCondition } from '../master-stores-interface';
import { setError, setErrorValidate } from 'app/reducers/error';
import { localizeFormat } from 'app/helpers/utils';
import { translate } from 'react-jhipster';

export const handleCheckEmptyData = (addCondition: MasterStoreSaveCondition, dispatch) => {
  if (!addCondition.store_code) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat('MSG_VAL_001', 'masterStores.modal.storeCode'),
      })
    );
    return false;
  }

  if (!addCondition.name) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat('MSG_VAL_001', 'masterStores.modal.storeName'),
      })
    );
    return false;
  }

  if (!addCondition.short_name) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat('MSG_VAL_001', 'masterStores.modal.storeAbbreviation'),
      })
    );
    return false;
  }

  return true;
};

export const handleCheckExistedByFE = (
  masterStoresList: IMasterStoreRecord[],
  masterStores: IMasterStoreRecord,
  dataSelected: IMasterStoreRecord = null,
  dispatch
) => {
  const existedData = masterStoresList.find((item) => item?.store_code === masterStores?.store_code);

  if (existedData && masterStores?.operation_type === 1 && !dataSelected) {
    dispatch(setError(translate('MSG_VAL_032')));
    return false;
  } else if (
    existedData &&
    masterStores?.operation_type === 1 &&
    dataSelected &&
    dataSelected?.store_code !== existedData?.store_code
  ) {
    dispatch(setError(translate('MSG_VAL_032')));
    return false;
  }

  return true;
};
