/* eslint-disable no-dupe-else-if */
import { IMasterStores, MasterStoreSaveCondition } from '../master-stores-interface';
import { setError, setErrorValidate } from 'app/reducers/error';
import { localizeFormat } from 'app/helpers/utils';
import { translate } from 'react-jhipster';

export const handleCheckEmptyData = (addCondition: MasterStoreSaveCondition, dispatch) => {
  if (!addCondition.code) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat('MSG_VAL_001', 'masterStores.modal.storeCode'),
      })
    );
    return false;
  }

  if (addCondition.code?.length !== 5) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat('MSG_VAL_028', 'masterStores.modal.storeCode', '5'),
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
  masterStoresList: IMasterStores[],
  masterStores: IMasterStores,
  dataSelected: IMasterStores = null,
  dispatch
) => {
  const existedData = masterStoresList.find((item) => item?.code === masterStores?.code);

  if (existedData && masterStores?.operation_type === 1 && !dataSelected) {
    dispatch(setError(translate('MSG_VAL_032')));
    return false;
  } else if (
    existedData &&
    masterStores?.operation_type === 1 &&
    dataSelected &&
    dataSelected?.code !== existedData?.code
  ) {
    dispatch(setError(translate('MSG_VAL_032')));
    return false;
  }

  return true;
};
