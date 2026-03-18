import React, { useEffect, useState } from 'react';
import { translate } from 'react-jhipster';
import './modal-preset.scss';
import { PresetLayout } from '../../menu-preset/interface-preset';
import {
  validateDate,
  validatePresetLayoutCode,
  validatePresetLayoutName,
  validateSelectStore,
} from 'app/modules/touch-menu/modal/modal-copy-preset/validate';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { setError } from 'app/reducers/error';
import { IStoreInfo } from 'app/reducers/store-reducer';
import { OperationType } from 'app/components/table/table-common';
import { checkExistPresetLayout } from 'app/services/preset-service';
import { colorPresets } from 'app/modules/touch-menu/detail/interface-preset';
import { MAX_MENU_BUTTON_COLUMN, MAX_MENU_BUTTON_ROW } from 'app/constants/constants';
import Dropdown from 'app/components/dropdown/dropdown';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { isInageyaHook } from 'app/hooks/hook-utils';
import TooltipDatePicker from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import {convertDateServer} from "app/helpers/date-utils";

interface ModalEditPresetProps {
  isEdit?: boolean;
  presetLayoutInit?: PresetLayout;
  storesInit?: IStoreInfo[];
  closeModal?: (presetLayout?: PresetLayout) => void;
}

export const ModalPreset: React.FC<ModalEditPresetProps> = ({ isEdit, presetLayoutInit, storesInit, closeModal }) => {
  const store: IStoreInfo[] = storesInit;

  if (
    isEdit &&
    presetLayoutInit &&
    !storesInit?.find((item) => {
      return item?.store_code === presetLayoutInit?.store_code;
    })
  ) {
    store?.unshift({
      store_code: presetLayoutInit?.store_code,
      store_name: presetLayoutInit?.store_name,
    });
  }

  const dropdownListCustom = (): any => {
    return store?.map((item) => ({
      code: item?.store_code,
      value: item?.store_code,
      name: item?.store_name,
    }));
  };
  const dispatch = useAppDispatch();
  const isInageya = isInageyaHook();
  const presetLayoutCodeLength = isInageya ? 5 : 4;
  const listPresets: PresetLayout[] = useAppSelector((state) => state.menuPresetReducer.presetLayouts);
  const [presetLayout, setPresetLayout] = useState<PresetLayout>(isEdit ? presetLayoutInit : null);
  const [selectStore, setSelectStore] = useState<IStoreInfo>(
    isEdit ? { store_code: presetLayoutInit?.store_code, store_name: presetLayoutInit?.store_name } : storesInit[0]
  );

  const [bookingDate, setStartDate] = useState<Date>(
    new Date((presetLayout?.booking_date && Date.parse(presetLayout?.booking_date)) ?? new Date().setHours(0, 0, 0, 0))
  );
  const updateDateTime = (date?: Date) => {
    setStartDate(date);
  };

  const handleDropdownChangeStore = (value: any) => {
    const selectedStore = storesInit.find((storeItem) => storeItem?.store_code === value?.toString());
    setSelectStore(selectedStore);
  };

  const handleInputChange = (value: string, field: keyof PresetLayout) => {
    if (field === 'preset_layout_code') {
      value = value?.replace(/\D/g, '');
    }
    setPresetLayout((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = (isCancel: boolean) => {
    if (isCancel) {
      closeModal(null);
      return;
    }

    if (!validateDate(bookingDate, dispatch)) return;
    if (!validateSelectStore(selectStore?.store_code, dispatch)) return;
    if (!validateSelectStore(selectStore?.store_name, dispatch)) return;
    if (!validatePresetLayoutCode(presetLayout?.preset_layout_code, dispatch)) return;
    if (!validatePresetLayoutName(presetLayout?.preset_layout_name, dispatch)) return;

    const dateString = convertDateServer(bookingDate);

    const is_copy_changed = isEdit &&
      presetLayout?.copy &&
      presetLayoutInit.operation_type === OperationType.Edit &&
      (selectStore?.store_code !== presetLayoutInit?.store_code ||
        dateString !== presetLayoutInit?.booking_date ||
        presetLayout?.preset_layout_code !== presetLayoutInit?.preset_layout_code);

    const newPreset: PresetLayout = {
      ...presetLayout,
      preset_layout_name: presetLayout?.preset_layout_name.trim(),
      operation_type: isEdit && !is_copy_changed ? presetLayout.operation_type : OperationType.New,
      operation_type_before: isEdit && !is_copy_changed ? presetLayout.operation_type : OperationType.New,
      store_code: selectStore?.store_code,
      store_name: selectStore?.store_name,
      booking_date: dateString,
      page_number: presetLayout?.page_number ?? 1,
      style_key: presetLayout?.style_key ?? colorPresets[0].type,
      button_column_count: MAX_MENU_BUTTON_COLUMN,
      button_row_count: MAX_MENU_BUTTON_ROW,
      is_copy_changed
    };
    setPresetLayout(newPreset);

    const existPreset = listPresets?.find((preset) => {
      const isSamePreset =
        preset?.store_code === newPreset?.store_code &&
        preset?.store_name === newPreset?.store_name &&
        preset?.booking_date === newPreset?.booking_date &&
        preset?.preset_layout_code === newPreset?.preset_layout_code;

      if (isSamePreset) {
        if (isEdit) {
          const isSameAsInit =
            preset?.store_code === presetLayoutInit?.store_code &&
            preset?.booking_date === presetLayoutInit?.booking_date &&
            preset?.preset_layout_code === presetLayoutInit?.preset_layout_code;

          if (!isSameAsInit) {
            return true;
          }
        } else {
          return true;
        }
      }
      return false;
    });

    if (existPreset) {
      if (existPreset.operation_type === OperationType.New) {
        dispatch(setError(translate('MSG_VAL_040')));
      } else {
        dispatch(setError(translate('MSG_VAL_032')));
      }
      return;
    }
    const request = {
      preset_layout_code: newPreset?.preset_layout_code,
      booking_date: newPreset?.booking_date,
      selected_stores: [selectStore.store_code],
    };

    // check existed by api
    const isSamePresetByApi =
      presetLayoutInit?.store_code === newPreset?.store_code &&
      presetLayoutInit?.store_name === newPreset?.store_name &&
      presetLayoutInit?.booking_date === newPreset?.booking_date &&
      presetLayoutInit?.preset_layout_code === newPreset?.preset_layout_code;

    dispatch(checkExistPresetLayout(request))
      .unwrap()
      .then((res) => {
        if (res.data.data?.items?.length > 0 && !isSamePresetByApi) {
          dispatch(setError(translate('MSG_VAL_032')));
          return;
        } else {
          closeModal(newPreset);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isEdit) {
      handleDropdownChangeStore(presetLayoutInit?.store_code);
    }
  }, [presetLayoutInit]);

  useEffect(() => {
    if (isEdit) {
      handleDropdownChangeStore(presetLayoutInit?.store_code);
    }
  }, [presetLayoutInit]);

  return (
    <DefaultModal
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={`employeeSettingDefaultModal.title.${isEdit ? 'editMode' : 'createMode'}`}
      cancelAction={() => handleSubmit(true)}
      confirmAction={() => handleSubmit(false)}
      scrollModal={false}
    >
      <div className={'body-modal-edit-preset'}>
        <Dropdown
          label="touchMenu.table.store"
          items={dropdownListCustom() ? dropdownListCustom() : dropdownListInitCustom}
          onChange={(item) => handleDropdownChangeStore(item?.value)}
          value={selectStore?.store_code}
          dataType={'dropdown-store-preset'}
        />
        <TooltipDatePicker
          required
          isShortDate
          labelText={'touchMenu.table.applyDate'}
          keyError={'touchMenu.table.applyDate'}
          checkEmpty
          initValue={bookingDate}
          onChange={(date: Date) => updateDateTime(date)}
          isPopover
          calendarPlacement={'bottom'}
          errorPlacement={'bottom'}
        />
        <InputTextCustom
          labelText="touchMenu.table.presetLayoutCode"
          value={presetLayout?.preset_layout_code}
          required={true}
          widthInput="100%"
          heightInput="60px"
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
          tabIndex={3}
        />

        <InputTextCustom
          labelText="touchMenu.table.presetLayoutName"
          widthInput="100%"
          heightInput="60px"
          maxLength={50}
          value={presetLayout?.preset_layout_name}
          onChange={(e: any) => handleInputChange(e.target?.value, 'preset_layout_name')}
          isRequire={true}
          datatype={'preset_layout_name_modal'}
          tabIndex={3}
          hasTrim
        />
      </div>
    </DefaultModal>
  );
};

const dropdownListInitCustom = [
  {
    code: '0',
    value: '0',
    name: 'を含む',
  },
  {
    code: '1',
    value: '1',
    name: 'から始まる',
  },
  {
    code: '2',
    value: '2',
    name: 'で終わる',
  },
];
export default ModalPreset;
