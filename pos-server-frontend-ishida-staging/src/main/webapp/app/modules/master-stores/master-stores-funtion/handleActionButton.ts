import { setError } from 'app/reducers/error';
import { ActionTypeButtonMasterStores } from '../enum-master-stores';
import { IMasterStoreRecord } from '../master-stores-interface';
import { localizeString } from 'app/helpers/utils';
import { translate } from 'react-jhipster';
import { deleteSelectedMasterStores } from 'app/reducers/master-stores-reducer';
import { isDeletable } from 'app/services/master-stores-service';

export const handleActionBottomButton = (
  action: ActionTypeButtonMasterStores,
  setOpenModal?: any,
  masterStoresList?: IMasterStoreRecord[],
  masterStoreSelected?: any,
  dispatch?: any
) => {
  const handleOpenModalErr = (msg: string) => {
    dispatch(setError(localizeString(msg)));
  };
  const dataSelected: IMasterStoreRecord = (masterStoreSelected && masterStoreSelected?.row) || null;
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
          dispatch(isDeletable({ selectedStore: dataSelected.store_code }))
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
    default:
      break;
  }
};
