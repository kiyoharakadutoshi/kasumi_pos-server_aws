import './preset.scss';
import React, { useEffect, useState } from 'react';
import TableContent from 'app/modules/touch-menu/detail/table-content';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { clearPreset, PresetState, setDefaultPreset, setSelectedColor } from './reducer/preset-reducer';
import { useLocation, useNavigate } from 'react-router';
import { colorButtons, colorPresets, PresetMenu } from './interface-preset';
import { MenuPresetState } from '../menu-preset/reducer/menu-preset-reducer';
import {
  convertQueryStringToObject,
  focusElementByNameWithTimeOut,
  isNullOrEmpty,
  isValidDate, nonBlankElse,
} from 'app/helpers/utils';
import { MASTER_CODE_FUNCTION, MAX_MENU_BUTTON_COLUMN, MAX_MENU_BUTTON_ROW } from 'app/constants/constants';
import { checkExistPresetLayout, getDetailPreset, savePresets } from 'app/services/preset-service';
import { getMasters } from 'app/services/master-service';
import { PresetLayout } from 'app/modules/touch-menu/menu-preset/interface-preset';
import { clearMessageError } from 'app/reducers/product-reducer';
import { clearHierarchyMessageError } from 'app/reducers/hierarchy-level-reducer';
import { validateDateEdit, validatePresetLayoutName } from 'app/modules/touch-menu/modal/modal-copy-preset/validate';
import { translate } from 'react-jhipster';
import { setError } from 'app/reducers/error';
import { OperationType } from 'app/components/table/table-common';
import Header from 'app/components/header/header';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import TooltipDatePicker from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import { convertDateServer } from 'app/helpers/date-utils';
import { UserRole } from 'app/hooks/hook-utils';
import { NOT_FOUND_DATA } from '@/constants/api-constants';
import SidePanelButton from 'app/modules/touch-menu/detail/side-panel/preset-button/side-panel-button';
import SidePanel from 'app/modules/touch-menu/detail/side-panel/side-panel';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';
import { URL_MAPPING } from 'app/router/url-mapping';

const MainPreset = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isStore } = UserRole();
  const presetMenuReducer: MenuPresetState = useAppSelector((state) => state.menuPresetReducer);
  const presetsReducer = useAppSelector((state) => state.presetReducer);
  const errorMessagePreset = useAppSelector(state => state.presetReducer.errorMessage);
  const presets: PresetMenu[] = presetsReducer.presets;
  const presetMenu: PresetMenu = presetsReducer.presetMenu;
  const [initialPresets, setInitialPresets] = useState(null);
  const [nonEdit, setNonEdit] = useState(true);
  const location = useLocation();
  const presetDetail: PresetLayout = convertQueryStringToObject(location.search);
  const [presetDetailInit, setPresetDetailInit] = useState(null);
  const [presetDetailEdit, setPresetDetailEdit] = useState(presetDetail);
  const [bookingDate, setBookingDate] = useState<Date>(
    new Date((presetDetail?.booking_date && Date.parse(presetDetail?.booking_date)) ?? new Date().setHours(0, 0, 0, 0))
  );

  const selectedItem: PresetState = useAppSelector(state => state.presetReducer);

  // Get html element to handle focus tab, enter when data changes causing UI to change accordingly
  elementChangeKeyListener(selectedItem);

  const updateDateTime = (date?: Date, presetDetailParam?: PresetLayout) => {
    const dateStart = date ? new Date(date) : null;
    const newState = {
      ...presetDetailParam,
      booking_date: convertDateServer(dateStart),
    };
    setPresetDetailEdit(newState);
    setBookingDate(dateStart);
  };

  const handleBackUp = () => {
    if (presetDetailInit) {
      dispatch(setDefaultPreset(presetDetailInit));
      const dateInit = new Date(
        (presetDetail?.booking_date && Date.parse(presetDetail?.booking_date)) ?? new Date().setHours(0, 0, 0, 0)
      );
      dispatch(setSelectedColor(colorPresets?.find((item) => item.type === presetMenu?.style_key) ?? colorPresets[0]));
      updateDateTime(dateInit, presetDetail);

      focusElementByNameWithTimeOut('preset-description', 20);
    }
  };

  const checkExistedItem = async () => {
    let isExisted = false;
    const requestCheckExisted = {
      preset_layout_code: presetDetailEdit?.preset_layout_code,
      booking_date: presetDetailEdit?.booking_date,
      selected_stores: [presetDetailEdit.store_code],
    };
    await dispatch(checkExistPresetLayout(requestCheckExisted))
      .unwrap()
      .then((res) => {
        if (res.data.data?.items?.length > 0) {
          isExisted = true;
          dispatch(setError(translate('MSG_VAL_032')));
          return;
        }
      })
      .catch(() => { });
    return isExisted;
  };

  const handleConfirm = async () => {
    const isChangeDate =
      new Date(presetDetail?.booking_date).getTime() !== new Date(presetDetailEdit?.booking_date).getTime();

    if (!validateDateEdit(bookingDate, dispatch, isChangeDate)) return;

    if (!validatePresetLayoutName(presetDetailEdit?.preset_layout_name, dispatch)) return;

    // handle check existed
    let isExisted = false;
    if (isChangeDate) isExisted = await checkExistedItem();
    // handle save new data
    !isExisted && handleConfirmPresetButton();
  };

  /**
   * Action Confirm save preset
   * In case remove all preset => add default preset
   */
  const handleConfirmPresetButton = () => {
    let preset_menu = presets
      .filter((item) => item.operation_type !== OperationType.Remove)
      .map((item, index) => ({
        ...item,
        preset_layout_name: presetDetailEdit?.preset_layout_name.trim(),
        booking_date: presetDetailEdit?.booking_date,
        style_key: nonBlankElse(item.style_key, colorPresets[0].type),
        page_number: index + 1,
        preset_menu_button: item.preset_menu_button
          .filter((button) => button.operation_type !== OperationType.Remove)
          .map((button) => ({
            ...button,
            product: null,
            page_number: index + 1,
            booking_date: presetDetailEdit?.booking_date,
            style_key: nonBlankElse(button.style_key, colorButtons[0].type),
          })),
      }));

    // In case remove all preset menu => create with default preset
    if (isNullOrEmpty(preset_menu)) {
      preset_menu = [
        {
          description: '',
          preset_menu_button: null,
          record_id: presetDetailEdit?.record_id,
          store_code: presetDetailEdit?.store_code,
          preset_layout_code: presetDetailEdit?.preset_layout_code,
          preset_layout_name: presetDetailEdit?.preset_layout_name.trim(),
          booking_date: presetDetailEdit?.booking_date,
          page_number: 1,
          style_key: colorPresets[0].type,
          button_column_count: MAX_MENU_BUTTON_COLUMN,
          button_row_count: MAX_MENU_BUTTON_ROW,
        },
      ];
    }

    dispatch(savePresets({ preset_menu, target_booking_date: presetDetail?.booking_date }));
  };

  useEffect(() => {
    if (initialPresets === null || initialPresets?.length === 0) {
      setInitialPresets(presets);
    }
    const isEditPresetValue =
      presetDetail?.preset_layout_name !== presetDetailEdit?.preset_layout_name ||
      presetDetail?.booking_date !== presetDetailEdit?.booking_date;
    setNonEdit(errorMessagePreset === NOT_FOUND_DATA || (initialPresets === presets && !isEditPresetValue));
  }, [presets, initialPresets, presetDetailEdit, errorMessagePreset]);

  useEffect(() => {
    if (presetMenuReducer.saveDataSuccess) {
      navigate(`/${URL_MAPPING.SC1501}`);
      dispatch(clearPreset());
    }
  }, [presetMenuReducer.saveDataSuccess]);

  useEffect(() => {
    dispatch(clearPreset());
    dispatch(clearMessageError());
    dispatch(clearHierarchyMessageError());
    if (
      !isNullOrEmpty(presetDetail?.preset_layout_code) &&
      !isNullOrEmpty(presetDetail?.preset_layout_name) &&
      !isNullOrEmpty(presetDetail?.booking_date) &&
      !isNullOrEmpty(presetDetail?.store_code)
    ) {
      dispatch(
        getDetailPreset({
          store_code: presetDetail?.store_code,
          preset_layout_code: presetDetail?.preset_layout_code,
          apply_date: presetDetail?.booking_date,
          preset_layout_name: presetDetail?.preset_layout_name,
        })
      )
        .unwrap()
        .then((response) => {
          setPresetDetailInit(response.data.data);
        })
        .catch(() => { });
      dispatch(getMasters({ master_code: [MASTER_CODE_FUNCTION] }));
    } else {
      navigate(`/${URL_MAPPING.SC1501}`);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'F4') {
        if (!nonEdit) handleBackUp();
      }
      if (event.key === 'F9') {
        if (!nonEdit && isValidDate(presetDetailEdit.booking_date)) {
          handleConfirm();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nonEdit, presetDetailEdit]);

  return (
    <div className={'main-body'}>
      <Header
        csv={{ disabled: true }}
        printer={{ disabled: true }}
        title={'detailMenu.title'}
        confirmBack={!nonEdit}
        hasESC={true}
        selectedStore={
          String(presetDetail.multiStore).toLowerCase() === 'true'
            ? '複数店選択中'
            : `${presetDetail?.store_code}:${presetDetail.store_name}`
        }
      />
      <div style={{ width: '400px' }}>{selectedItem?.presetButton ? <SidePanelButton /> : <SidePanel />}</div>
      <div className={'main-content'}>
        <div className="content">
          <div className="header-content">
            <div className="group-first-input-header-content">
              <InputTextCustom
                className="header-content-store-name"
                value={`${presetDetailEdit?.store_code} : ${presetDetailEdit?.store_name ?? ''}`}
                disabled={true}
                widthInput="510px"
                labelText="detailMenu.store"
              />

              <InputTextCustom
                className="preset-layout-name"
                value={presetDetailEdit?.preset_layout_name}
                widthInput="510px"
                maxLength={50}
                labelText="detailMenu.presetLayoutName"
                hasTrim
                onChange={(e: any) => setPresetDetailEdit({ ...presetDetailEdit, preset_layout_name: e.target.value })}
                isRequire={!isStore}
                disabled={isStore}
              />
            </div>
            <div className="group-second-input-header-content">
              <InputTextCustom
                value={presetDetailEdit?.preset_layout_code}
                widthInput="586px"
                disabled={true}
                labelText="detailMenu.presetLayoutCode"
              />
              <TooltipDatePicker
                required={!isStore}
                isShortDate
                labelText={'touchMenu.table.applyDate'}
                checkEmpty
                keyError={'touchMenu.table.applyDate'}
                initValue={bookingDate}
                onChange={(date: Date) => updateDateTime(date, presetDetailEdit)}
                isPopover
                calendarPlacement={'bottom-end'}
                disabled={isStore}
              />
            </div>
            <div className="group-button-header-preset">
              <div className="button-normal">
                <ButtonPrimary text="global.f04Clear" disabled={nonEdit} onClick={handleBackUp} />
              </div>
              <div className="button-normal">
                <ButtonPrimary
                  text="global.f09Confirm"
                  disabled={nonEdit || !isValidDate(presetDetailEdit.booking_date)}
                  onClick={handleConfirm}
                />
              </div>
            </div>
          </div>
          <TableContent />
        </div>
      </div>
    </div>
  );
};

export default MainPreset;
