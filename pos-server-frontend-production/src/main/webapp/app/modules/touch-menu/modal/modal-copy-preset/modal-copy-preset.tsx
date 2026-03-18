import React, { useEffect, useState } from 'react';
import './modal-copy-preset.scss';
import { Translate } from 'react-jhipster';
import { useAppDispatch } from 'app/config/store';
import { InputTitle } from 'app/components/input/styled';
import { IStoreInfo } from 'app/reducers/store-reducer';
import {
  Action,
  IGenerateCode,
  initPresetLayout,
  IPresetExist,
  PresetLayout,
} from '../../menu-preset/interface-preset';
import ModalConfirmPreset from 'app/modules/touch-menu/modal/modal-confirm-preset/modal-confirm-preset';
import { validateDate, validatePresetLayoutCode, validatePresetLayoutName, validateSelectMultiStore } from './validate';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { OperationType } from 'app/components/table/table-common';
import { checkExistPresetLayout, generateCode } from 'app/services/preset-service';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { isInageyaHook } from 'app/hooks/hook-utils';
import TooltipDatePicker from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import { convertDateServer } from 'app/helpers/date-utils';

interface ModalCopyPresetProps {
  closeModal?: (preset?: PresetLayout[]) => void;
  listPreset: PresetLayout[];
  stores: IStoreInfo[];
}

export const ModalCopyPreset: React.FC<ModalCopyPresetProps> = ({ closeModal, listPreset, stores }) => {
  const dispatch = useAppDispatch();
  const isInageya = isInageyaHook();
  const presetLayoutCodeLength = isInageya ? 5 : 4;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [presetValue, setPresetValue] = useState<PresetLayout>(initPresetLayout);
  const [listStore, setStoreProps] = useState(stores);
  const [listStoreExist, setListStoreExist] = useState<IPresetExist[]>();

  const toggleChecked = (index?: number) => {
    setStoreProps((prevStores) =>
      prevStores.map((store, i) =>
        i === index
          ? {
              ...store,
              selected: !store.selected,
            }
          : store
      )
    );
  };
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setHours(0, 0, 0, 0)));

  const updateDateTime = (date?: Date) => {
    const newState = {
      ...presetValue,
      booking_date: convertDateServer(date),
    };
    setPresetValue(newState);
    setStartDate(date);
  };

  const checkedAll = () => {
    setStoreProps((prevStores) => prevStores.map((store) => ({ ...store, selected: true })));
  };
  const unCheckedAll = () => {
    setStoreProps((prevStores) => prevStores.map((store) => ({ ...store, selected: false })));
  };

  const handleConfirm = () => {
    const selectedStores = listStore?.filter((storeItem) => storeItem.selected);
    if (!validateDate(startDate, dispatch)) return;
    if (!validatePresetLayoutCode(presetValue.preset_layout_code, dispatch)) return;
    if (!validatePresetLayoutName(presetValue.preset_layout_name, dispatch)) return;
    if (!validateSelectMultiStore(selectedStores, dispatch)) return;
    const dataNewPreset = {
      preset_layout_code: presetValue?.preset_layout_code,
      preset_layout_name: presetValue?.preset_layout_name,
      booking_date: presetValue?.booking_date,
      selected_stores: selectedStores.map((store) => {
        return store.store_code;
      }),
    };
    dispatch(checkExistPresetLayout(dataNewPreset))
      .unwrap()
      .then((res) => {
        const presetExist = res.data.data?.items;
        if (presetExist) {
          const listSelectedStores = listStore?.filter((storeItem) => storeItem.selected);
          if (presetExist?.length > 0) {
            setListStoreExist(presetExist);
            setModalIsOpen(true);
          } else {
            copyPreset(listSelectedStores);
          }
        }
      })
      .catch(() => {});
  };

  const copyPreset = (listStoreInfo: IStoreInfo[]) => {
    let updatedList = [...listPreset];
    listStoreInfo.forEach((store) => {
      const newState: PresetLayout = {
        ...presetValue,
        store_code: store.store_code,
        store_name: store.store_name,
        operation_type: OperationType.New,
        operation_type_before: OperationType.New,
        copy: true,
      };
      updatedList = [newState, ...updatedList];
    });
    closeModal(updatedList);
  };

  const confirmOverride = (listStoreCheckBox: any[]) => {
    if (listStoreCheckBox === null) {
      setModalIsOpen(false);
      return;
    }
    const storeCreatePresetNotExist = listStore
      ?.filter(
        (storeItem) =>
          storeItem.selected && !listStoreExist?.find((storeExist) => storeExist.store_code === storeItem.store_code)
      )
      ?.map((item) => {
        return item.store_code;
      });

    const storeCreateExist = listStoreCheckBox
      ?.filter((store) => store.override === Action.create)
      .map((store) => store.store_code);

    const storeEditPreset = listStore.filter(
      (item) =>
        !storeCreateExist.some((storeCode) => storeCode === item.store_code) &&
        !storeCreatePresetNotExist.some((storeCode) => storeCode === item.store_code) &&
        item.selected
    );

    let listCodeGenerate: IGenerateCode[] = listStore
      ?.filter(
        (storeItem) =>
          storeItem.selected && !listStoreExist?.find((storeExist) => storeExist.store_code === storeItem.store_code)
      )
      ?.map((item) => {
        return {
          store_code: item.store_code,
          id_value: presetValue?.preset_layout_code,
        };
      });

    if (storeCreateExist?.length > 0) {
      dispatch(generateCode({ target_stores: storeCreateExist }))
        .unwrap()
        .then((response) => {
          listCodeGenerate = listCodeGenerate.concat(response.data.data?.items);
          handleConfirmOverride(listCodeGenerate, storeEditPreset);
          return;
        })
        .catch(() => {});
    } else {
      handleConfirmOverride(listCodeGenerate, storeEditPreset);
    }
  };

  const handleInputChange = (value: string, field: keyof PresetLayout) => {
    setPresetValue((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleConfirmOverride = (listCodeGenerated?: IGenerateCode[], storeEditPreset?: any) => {
    const selectedStores = listStore?.filter((storeItem) => storeItem.selected);
    let updatedList = [...listPreset];
    listPreset?.forEach((preset, index) => {
      const indexPreset = storeEditPreset.findIndex((storeEdit: { store_code: string }) => {
        return (
          preset.store_code === storeEdit.store_code &&
          preset?.preset_layout_code === presetValue?.preset_layout_code &&
          preset?.booking_date === presetValue?.booking_date
        );
      });

      if (indexPreset >= 0) {
        storeEditPreset.splice(indexPreset, 1);
        updatedList[index] = {
          ...preset,
          store_code: preset.store_code,
          store_name: preset.store_name,
          operation_type: OperationType.Edit,
          operation_type_before: OperationType.Edit,
          copy: true,
          preset_layout_name: presetValue?.preset_layout_name,
        };
      }
    });

    listCodeGenerated
      ?.concat(storeEditPreset)
      .sort((item1, item2) => parseInt(item2.store_code, 10) - parseInt(item1.store_code, 10))
      ?.forEach((item) => {
        const store = selectedStores?.find((storeItem) => {
          return storeItem.store_code === item.store_code;
        });

        const presetNew: PresetLayout = {
          ...presetValue,
          store_code: store.store_code,
          store_name: store.store_name,
          operation_type: OperationType.New,
          operation_type_before: OperationType.New,
          preset_layout_code: item.id_value ?? presetValue.preset_layout_code,
          copy: true,
        };
        updatedList = [presetNew, ...updatedList];
      });
    setModalIsOpen(false);
    closeModal(updatedList);
  };

  useEffect(() => {
    updateDateTime(startDate);
  }, []);

  return (
    <div className="modal-copy-preset">
      <DefaultModal
        titleModal="touchMenu.button.copy"
        headerType={ModalMode.Copy}
        cancelAction={() => closeModal(null)}
        confirmAction={handleConfirm}
      >
        <TooltipDatePicker
          required
          isShortDate
          labelText={'touchMenu.table.applyDate'}
          keyError={'touchMenu.table.applyDate'}
          checkEmpty
          initValue={startDate}
          onChange={(date: Date) => updateDateTime(date)}
          isPopover
          calendarPlacement={'bottom'}
          errorPlacement={'top'}
        />

        <InputTextCustom
          labelText="touchMenu.table.presetLayoutCode"
          value={presetValue?.preset_layout_code}
          required={true}
          maxLength={presetLayoutCodeLength}
          type={'number'}
          addZero={!isInageya}
          onChange={(value: any) => handleInputChange(value.target?.value, 'preset_layout_code')}
          datatype={'preset_layout_code_modal'}
          isRequire={true}
          onBlur={(e: any) => {
            if (isInageya) return;
            handleInputChange(
              e.target.value ? e.target.value.padStart(presetLayoutCodeLength, '0') : e.target.value,
              'preset_layout_code'
            );
          }}
          tabIndex={0}
        />
        <InputTextCustom
          labelText={'touchMenu.table.presetLayoutName'}
          value={presetValue ? presetValue.preset_layout_name : ''}
          required={true}
          maxLength={50}
          onChange={(e: any) => handleInputChange(e.target.value, 'preset_layout_name')}
          datatype={'preset_layout_name_modal'}
          isRequire={true}
          tabIndex={0}
          hasTrim
        />

        <div className={'button-select'}>
          <div className="button-normal">
            <ButtonPrimary
              onClick={checkedAll}
              text="touchMenu.button.selectAll"
              disabled={listStore.every((item) => item.selected || listStore.length === 0)}
              tabIndex={0}
            />
          </div>

          <div style={{ width: '10px' }}></div>
          <div className="button-normal">
            <ButtonPrimary
              onClick={unCheckedAll}
              text="touchMenu.button.unSelectAll"
              disabled={!listStore.some((item) => item.selected || listStore.length === 0)}
              tabIndex={0}
            />
          </div>
        </div>
        <InputTitle style={{ height: 40, fontSize: 24 }}>
          <Translate contentKey={'touchMenu.modal.store'} />
          <span style={{ color: '#bc1c42' }}>*</span>
        </InputTitle>
        <div className={'checkbox-store'}>
          <ul className="list-unstyled list-store-preset">
            {listStore?.map((store, index) => (
              <li key={store.store_code} className="list-store-item">
                <CheckboxButton
                  id={index + store.store_code}
                  onChange={() => toggleChecked(index)}
                  checkBoxValue={store.store_code}
                  checked={store.selected}
                  tabIndex={0}
                />
                <div className="text-store" onClick={() => toggleChecked(index)}>
                  {store.store_code + ' : ' + store.store_name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DefaultModal>
      {modalIsOpen && <ModalConfirmPreset listPresetExist={listStoreExist} closeModal={confirmOverride} />}
    </div>
  );
};

export default ModalCopyPreset;
