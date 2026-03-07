import { setError } from 'app/reducers/error';
import { ActionTypeButtonMasterStores } from '../enum-master-stores';
import { IMasterStores } from '../master-stores-interface';
import { localizeString } from 'app/helpers/utils';
import { translate } from 'react-jhipster';
import { addListMasterStores, deleteSelectedMasterStores } from 'app/reducers/master-stores-reducer';
import { getListMasterStores, isDeletable } from 'app/services/master-stores-service';
import { OperationType } from 'app/components/table/table-common';

export const handleActionBottomButton = (
  action: ActionTypeButtonMasterStores,
  setOpenModal?: any,
  masterStoresList?: IMasterStores[],
  masterStoreSelected?: any,
  dispatch?: any,
  masterStoreSearchCondition?: any
) => {
  const handleOpenModalErr = (msg: string) => {
    dispatch(setError(localizeString(msg)));
  };
  const dataSelected: IMasterStores = (masterStoreSelected && masterStoreSelected?.row) || null;
  const hasItemCopy = masterStoresList?.some((item) => item?.copy);

  switch (action) {
    case ActionTypeButtonMasterStores.Delete:
      if (hasItemCopy) {
        handleOpenModalErr(translate('MSG_VAL_012'));
      } else {
        // Check if created new data but click confirm and click delete
        if (dataSelected?.operation_type_before === 1) {
          dispatch(deleteSelectedMasterStores());
          return;
        }
        if (dataSelected) {
          dispatch(isDeletable({ selectedStore: dataSelected.code }))
            .unwrap()
            .then((response) => {
              const isDelete = response?.data?.data?.deletable;
              if (isDelete) {
                dispatch(deleteSelectedMasterStores());
              } else {
                handleOpenModalErr(translate('MSG_VAL_055'));
              }
            });
        }
      }
      break;
    case ActionTypeButtonMasterStores.Update:
      if (hasItemCopy) {
        if (dataSelected.copy) {
          setOpenModal(true);
        } else {
          handleOpenModalErr(translate('MSG_VAL_012'));
        }
      } else {
        // if doesn't have item copy
        if (dataSelected?.operation_type === 3) {
          handleOpenModalErr(translate('MSG_VAL_010'));
          return;
        }
        setOpenModal(true);
      }
      break;
    case ActionTypeButtonMasterStores.Create:
      if (hasItemCopy) {
        handleOpenModalErr(translate('MSG_VAL_012'));
        return;
      }
      setOpenModal(true);
      break;
    case ActionTypeButtonMasterStores.Copy: {
      const canCopy = !masterStoresList?.some((item) => item.operation_type && !item.copy);
      if (canCopy) {
        setOpenModal(true);
      } else {
        handleOpenModalErr(translate('MSG_VAL_013'));
      }
      break;
    }
    default:
      break;
  }
};
