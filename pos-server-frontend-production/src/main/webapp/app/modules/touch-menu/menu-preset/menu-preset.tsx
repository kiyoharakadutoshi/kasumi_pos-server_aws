import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './menu-preset.scss';
import { translate } from 'react-jhipster';
import ModalPreset from 'app/modules/touch-menu/modal/modal-preset/modal-preset';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { ActionType } from './enum-preset';
import { IPresetCopyValue, PresetLayout } from './interface-preset';
import {
  addMenuPreset,
  clearDataSearch,
  clearMenuPreset,
  clearStatus,
  copyPresetLayout,
  deleteSelectedPreset,
  MenuPresetState,
  selectPresetLayout,
  setNodata,
  setValuePresetSearch,
  updatePresetLayout,
} from './reducer/menu-preset-reducer';
import { dropdownList } from './data-input';
import { useNavigate, useNavigationType } from 'react-router';
import { setError } from 'app/reducers/error';
import {
  convertObjectToQueryString,
  focusElementByNameWithTimeOut,
  formatValue,
  isNullOrEmpty,
  localizeString,
} from 'app/helpers/utils';
import { IStoreSate } from 'app/reducers/store-reducer';
import ModalCopyPreset from '../modal/modal-copy-preset/modal-copy-preset';

import { copyPreset, getListPresetLayout, saveListPresets } from 'app/services/preset-service';
import { OperationType } from 'app/components/table/table-common';
import Header from 'app/components/header/header';
import BottomButton from 'app/components/bottom-button/bottom-button';
import { navigateTo } from 'app/reducers/confirm-reducer';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import Dropdown from 'app/components/dropdown/dropdown';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';

import { FormProvider, useForm } from 'react-hook-form';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import { CellContext } from '@tanstack/react-table';
import TooltipNumberInputText from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text';
import { isInageyaHook, UserRole } from 'app/hooks/hook-utils';
import { fullDateToSortDate } from 'app/helpers/date-utils';

const TouchMenu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formConfig = useForm();

  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);
  const presetLayouts: PresetLayout[] = useAppSelector((state) => state.menuPresetReducer.presetLayouts);
  const presetMenu: MenuPresetState = useAppSelector((state) => state.menuPresetReducer);
  const saveDataSuccess: boolean = useAppSelector((state) => state.menuPresetReducer.saveDataSuccess);
  const [isEdit, setIsEdit] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(true);
  const isInageya = isInageyaHook();
  const { isStore } = UserRole();
  const presetLayoutCodeLength = isInageya ? 5 : 4;
  const [openModalCopy, setOpenModalCopy] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [presetLayoutCopy, setPresetLayoutCopy] = useState<PresetLayout>();
  const navigationType = useNavigationType();
  const selectedStoresBeforeConfirm = storeReducer?.selectedStores;
  const [showNoData, setShowNoData] = useState(false);
  const [disableButton, setDisableButton] = useState<boolean>(isNullOrEmpty(selectedStoresBeforeConfirm));
  const disabledSelect = isStore || presetMenu.presetSelected === null;

  const handleDropdownChangePresetCode = (value: any) => {
    dispatch(setValuePresetSearch({ key: 'preset_layout_code_type', value }));
  };

  const handleDropdownChangeProductName = (value: any) => {
    dispatch(setValuePresetSearch({ key: 'preset_layout_name_type', value }));
  };

  const handleSearchPreset = () => {
    if (isNullOrEmpty(selectedStoresBeforeConfirm)) {
      dispatch(clearMenuPreset());
      dispatch(clearDataSearch());
      return;
    }

    if (showNoData) {
      setShowNoData(false);
      return dispatch(setNodata(true));
    }
    dispatch(
      getListPresetLayout({
        ...presetMenu?.presetSearch,
        preset_layout_name: presetMenu?.presetSearch?.preset_layout_name?.trim(),
        preset_layout_code: presetMenu?.presetSearch?.preset_layout_code?.trim(),
        selected_stores: selectedStoresBeforeConfirm,
      })
    )
      .unwrap()
      .then(() => formConfig.setValue('selectedRows', null))
      .catch(() => {});
  };

  useEffect(() => {
    const isReload = presetLayouts.some((pre) => pre?.operation_type);
    isReload &&
      dispatch(
        getListPresetLayout({
          ...presetMenu?.presetSearch,
          preset_layout_name: presetMenu?.presetSearch?.preset_layout_name?.trim(),
          preset_layout_code: presetMenu?.presetSearch?.preset_layout_code?.trim(),
          selected_stores: selectedStoresBeforeConfirm,
        })
      );
  }, []);

  /**
   * Focus first element when back from SC1502
   */
  useEffect(() => {
    if (isNullOrEmpty(storeReducer.selectedStores)) return;
    focusFirstElement(false, false, 100);
  }, []);

  const handleAction = (action: ActionType) => {
    const selectedPreset = presetLayouts?.[presetMenu.presetSelected?.index];
    if (!selectedPreset && action !== ActionType.Create) {
      handleOpenModalErr('MSG_ERR_010');
      return;
    }

    const hasItemCopy = presetLayouts?.some((item) => item.copy);
    switch (action) {
      case ActionType.Delete:
        if (hasItemCopy && !selectedPreset?.copy) {
          handleOpenModalErr(translate('MSG_VAL_012'));
        } else {
          dispatch(deleteSelectedPreset());
        }
        break;
      case ActionType.Update:
        if (hasItemCopy) {
          if (selectedPreset?.operation_type === OperationType.Remove) {
            handleOpenModalErr(translate('MSG_VAL_010'));
            return;
          }

          if (selectedPreset?.copy) {
            setIsEdit(true);
            setOpenModalEdit(true);
          } else {
            handleOpenModalErr(translate('MSG_VAL_012'));
          }
        } else {
          switch (selectedPreset?.operation_type) {
            case OperationType.New:
              setIsEdit(true);
              setOpenModalEdit(true);
              break;
            case OperationType.Remove:
              handleOpenModalErr(translate('MSG_VAL_010'));
              break;
            default: {
              const query = `detail?${convertObjectToQueryString({
                ...selectedPreset,
                multiStore: storeReducer.selectedStores?.length > 1,
              })}`;
              if (!disableConfirm) {
                dispatch(navigateTo(`touch-menu/${query}`));
                return;
              }
              navigate(query);
              break;
            }
          }
        }
        break;
      case ActionType.Create:
        if (hasItemCopy) {
          handleOpenModalErr(translate('MSG_VAL_012'));
        } else {
          setOpenModalEdit(true);
          setIsEdit(false);
        }
        break;
      case ActionType.Copy: {
        const canCopy = !presetLayouts?.some((preset) => preset.operation_type);
        if (canCopy) {
          setOpenModalCopy(true);
        } else {
          handleOpenModalErr(translate('MSG_VAL_013'));
        }
        break;
      }
      default:
        break;
    }
  };

  const handleConfirmModalEdit = (preset?: PresetLayout) => {
    setOpenModalEdit(false);
    if (preset) {
      if (isEdit) {
        dispatch(updatePresetLayout(preset));
      } else {
        dispatch(addMenuPreset(preset));
      }
    }
    setIsEdit(false);
  };

  const handleConfirmModalCopy = (presets?: PresetLayout[]) => {
    setOpenModalCopy(false);
    if (presets) {
      setPresetLayoutCopy(presetMenu.presetSelected?.row);
      dispatch(copyPresetLayout(presets));
    }
  };

  const handleOpenModalErr = (msg: string) => {
    dispatch(setError(localizeString(msg)));
  };

  const handleConfirm = () => {
    const filteredLayouts = presetLayouts.filter((item) => {
      const isValidOperationType =
        item.operation_type === OperationType.New ||
        item.operation_type === OperationType.Edit ||
        item.operation_type === OperationType.Remove;
      if (!isValidOperationType) return false;

      return !(
        item.operation_type === OperationType.Remove &&
        (item.operation_type_before === OperationType.New ||
          (item.operation_type_before === OperationType.Edit && item.copy))
      );
    });

    if (filteredLayouts?.length > 0) {
      const listTouchMenuCopy = filteredLayouts.filter((item) => item?.copy === true);
      if (listTouchMenuCopy?.length > 0) {
        const request: IPresetCopyValue = {
          preset_layout_code: presetLayoutCopy?.preset_layout_code,
          preset_layout_name: presetLayoutCopy?.preset_layout_name,
          booking_date: presetLayoutCopy?.booking_date,
          store: presetLayoutCopy?.store_code,
          page_number: presetLayoutCopy?.page_number,
          items: listTouchMenuCopy?.map((item) => {
            return {
              preset_layout_code: item.preset_layout_code,
              preset_layout_name: item.preset_layout_name,
              booking_date: item.booking_date,
              store: item.store_code,
              page_number: item.page_number,
            };
          }),
        };
        dispatch(copyPreset(request));
      }
      const listTouchMenuNormal = filteredLayouts
        .filter((item) => item.copy !== true)
        .map((item) => ({
          ...item,
          preset_layout_name: item.preset_layout_name.trim(),
        }));

      if (listTouchMenuNormal?.length > 0) {
        const request = { preset_menu: listTouchMenuNormal };
        dispatch(saveListPresets(request));
      }
    } else {
      handleSearchPreset();
    }
  };

  // handle disable button search and input
  useEffect(() => {
    setDisableButton(isNullOrEmpty(selectedStoresBeforeConfirm));
  }, [selectedStoresBeforeConfirm]);

  /**
   * Get list preset when save data success
   */
  useEffect(() => {
    if (saveDataSuccess) {
      handleSearchPreset();
      dispatch(clearStatus());
    }
  }, [saveDataSuccess]);

  /**
   * Update status enabled, disabled button Confirm
   */
  useEffect(() => {
    setDisableConfirm(!(presetLayouts?.filter((item) => item.operation_type)?.length > 0));
  }, [presetLayouts]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (navigationType !== 'POP') {
      dispatch(clearMenuPreset());
    }
  }, [navigationType]);

  useEffect(() => {
    if (!presetMenu.presetSelected) {
      formConfig.setValue('selectedRows', []);
    }
  }, [presetMenu.presetSelected]);

  // clear data in table and condition search when change store
  const handleClearDataAndConditionSearch = () => {
    dispatch(clearMenuPreset());
    dispatch(clearDataSearch());
    focusFirstElement(false, false, 350);
  };
  /**
   * Create column header table
   */
  const columns = React.useMemo<TableColumnDef<PresetLayout>[]>(
    () => [
      {
        accessorKey: 'store_code',
        header: 'touchMenu.table.store',
        size: 35,
        type: 'text',
        textAlign: 'left',
        option(info: CellContext<PresetLayout, unknown>, presetDefault: any) {
          const record = info?.row?.original;
          return {
            value: formatValue(record?.store_code, record?.store_name),
            defaultValue: formatValue(presetDefault?.store_code, presetDefault?.store_name),
          };
        },
      },
      {
        accessorKey: 'preset_layout_code',
        textAlign: 'right',
        type: 'text',
        header: 'touchMenu.table.presetLayoutCode',
        size: 20,
      },
      {
        accessorKey: 'preset_layout_name',
        type: 'text',
        textAlign: 'left',
        header: 'touchMenu.table.presetLayoutName',
        size: 37,
      },
      {
        accessorKey: 'booking_date',
        type: 'text',
        textAlign: 'left',
        header: 'touchMenu.table.applyDate',
        size: 8,
        option(info: CellContext<PresetLayout, unknown>, presetDefault: any) {
          const record = info?.row?.original;
          return {
            value: fullDateToSortDate(record?.booking_date),
            defaultValue: fullDateToSortDate(presetDefault?.booking_date),
          };
        },
      },
    ],
    []
  );

  /**
   * Update selected row redux store
   */
  useEffect(() => {
    const selectedRow = formConfig.getValues('selectedRows')?.[0];
    if (selectedRow) {
      dispatch(selectPresetLayout({ row: selectedRow.original, index: selectedRow.index }));
    } else {
      dispatch(selectPresetLayout(null));
    }
  }, [formConfig.watch('selectedRows')]);

  /**
   * Focus first element search
   * @param expand boolean
   * @param isDirty
   * @param duration number
   */
  const focusFirstElement = (expand?: boolean, isDirty?: boolean, duration?: number) => {
    if (expand || isDirty) return;
    focusElementByNameWithTimeOut('preset_layout_code', duration);
  };

  return (
    <FormProvider {...formConfig}>
      <div className="menu-preset-wrapper">
        <Header
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          title="プリセット設定"
          confirmBack={!disableConfirm}
          hasESC={true}
        />
        {openModalCopy && (
          <ModalCopyPreset
            closeModal={(presets?: PresetLayout[]) => handleConfirmModalCopy(presets)}
            listPreset={presetLayouts}
            stores={storeReducer?.stores?.map((store) => ({
              ...store,
              selected: true,
            }))}
          />
        )}
        {openModalEdit && (
          <ModalPreset
            isEdit={isEdit}
            closeModal={(preset?: PresetLayout) => handleConfirmModalEdit(preset)}
            storesInit={storeReducer?.stores?.filter((store) => store.selected)}
            presetLayoutInit={presetLayouts?.[presetMenu.presetSelected?.index]}
          />
        )}
        <div className={'preset-main'}>
          <div className="right-panel">
            <SidebarStore
              selectMultiple={true}
              dataSearchChange={presetLayouts}
              onChangeCollapseExpand={(expanded, isDirty) => focusFirstElement(expanded, isDirty, 20)}
              disabledSearch={disableButton}
              expanded={true}
              hasData={presetLayouts?.length > 0}
              actionConfirm={handleClearDataAndConditionSearch}
            />
          </div>

          <div className="menu-preset">
            <div className="right-top">
              <div className="list-item-bottom">
                <div className="item-bottom">
                  <TooltipNumberInputText
                    name={'preset_layout_code'}
                    label="touchMenu.presetLayoutCode"
                    value={presetMenu.presetSearch?.preset_layout_code}
                    maxLength={presetLayoutCodeLength}
                    onChange={(value: string) => {
                      dispatch(setValuePresetSearch({ key: 'preset_layout_code', value }));
                    }}
                    disabled={disableButton}
                  />
                  <Dropdown
                    isHiddenCode={true}
                    value={presetMenu.presetSearch?.preset_layout_code_type}
                    items={dropdownList && dropdownList}
                    onChange={(item) => handleDropdownChangePresetCode(item?.value as any)}
                    disabled={disableButton}
                  />
                </div>
                <div className="item-bottom">
                  <InputTextCustom
                    labelText="touchMenu.table.presetLayoutName"
                    value={presetMenu.presetSearch?.preset_layout_name}
                    width="100%"
                    maxLength={50}
                    onChange={(e: any) => {
                      dispatch(
                        setValuePresetSearch({
                          key: 'preset_layout_name',
                          value: e.target.value,
                        })
                      );
                    }}
                    onBlur={() => {
                      const trimmedValue = presetMenu.presetSearch?.preset_layout_name.trim();
                      dispatch(
                        setValuePresetSearch({
                          key: 'preset_layout_name',
                          value: trimmedValue,
                        })
                      );
                    }}
                    disabled={disableButton}
                  />
                  <Dropdown
                    isHiddenCode={true}
                    value={presetMenu.presetSearch?.preset_layout_name_type}
                    items={dropdownList && dropdownList}
                    onChange={(item) => handleDropdownChangeProductName(item?.value as any)}
                    disabled={disableButton}
                  />
                </div>
                <FuncKeyDirtyCheckButton
                  dirtyCheck={!disableConfirm}
                  okDirtyCheckAction={handleSearchPreset}
                  text="action.f12Search"
                  onClickAction={handleSearchPreset}
                  disabled={disableButton}
                  funcKeyListener={presetMenu}
                />
              </div>
            </div>
            <TableData<PresetLayout>
              columns={columns}
              data={presetLayouts}
              defaultData={presetMenu?.presetLayoutDefaults}
              onDoubleClick={() => handleAction(ActionType.Update)}
              showNoData={presetMenu.noData}
              selectedIndexRows={presetMenu?.presetSelected ? [presetMenu?.presetSelected?.index] : null}
            />
          </div>
          <BottomButton
            deleteAction={() => handleAction(ActionType.Delete)}
            disableDelete={disabledSelect}
            copyAction={() => handleAction(ActionType.Copy)}
            disableCopy={disabledSelect}
            editAction={() => handleAction(ActionType.Update)}
            disableEdit={presetMenu?.presetSelected === null}
            addAction={() => handleAction(ActionType.Create)}
            confirmAction={handleConfirm}
            disableConfirm={isStore || disableConfirm}
            canKeyDown={!openModalCopy && !openModalEdit}
            disableAdd={isStore || disableButton}
            stateChange={presetMenu.presetSelected}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default TouchMenu;
