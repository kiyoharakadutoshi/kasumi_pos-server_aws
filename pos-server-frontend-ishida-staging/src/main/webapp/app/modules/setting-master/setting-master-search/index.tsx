import React, { useEffect } from 'react';

// component
import Dropdown from 'app/components/dropdown/dropdown';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import useFocusInput from '@/modules/setting-master/hook/useFocusInput';

// router
import { Action } from '@remix-run/router';
import { useNavigationType } from 'react-router';

// redux
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { IStoreInfo, selectAllStore } from 'app/reducers/store-reducer';
import { IMasterCode } from 'app/reducers/master-reducer';
import { settingMasterSlice, SettingMasterState } from 'app/reducers/setting-master-reducer';

// Api
import { getCashRegister, getPresetsCashMachine } from 'app/services/setting-master-service';
import { getMasters } from 'app/services/master-service';

// util
import { createDropdownListCustom, isNullOrEmpty } from 'app/helpers/utils';

// css
import './../master-home.scss';
import { CODE_MASTER } from 'app/constants/constants';
import { InstoreMasterCode, InstoreMasterState } from 'app/modules/setting-master/interface-setting';
import { mapCodeMaster } from 'app/modules/setting-master/utils-setting-master';
import { useFormContext } from 'react-hook-form';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';

export const LIST_MASTER_CODE = [
  CODE_MASTER.INSTORE_TYPE,
  CODE_MASTER.NOTE_TYPE,
  CODE_MASTER.DEVICE_CLASS,
  CODE_MASTER.KEYBOARD_LAYOUT,
  CODE_MASTER.FUNCTION_LAYOUT,
  CODE_MASTER.RECEIPT_MESSAGE,
];

const SettingMasterSearch = ({
  confirmChange,
  disabledSearch,
  onCloseSideBar,
  handleResetSelected,
}: {
  confirmChange?: boolean;
  disabledSearch?: boolean;
  onCloseSideBar?: (disableSearch: boolean) => void;
  handleResetSelected?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const settingMasterState: SettingMasterState = useAppSelector((state) => state.settingMasterReducer);
  const masters: IMasterCode[] = settingMasterState?.masters;
  const actionSideBar = settingMasterSlice.actions;
  const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const noData = useAppSelector((state) => state.settingMasterReducer.noData);
  const { handleFocusInput } = useFocusInput();

  const { setValue, watch } = useFormContext<InstoreMasterState>();

  const navigationType = useNavigationType();

  useEffect(() => setValue('codeMaster', mapCodeMaster(masters)), [masters]);

  const instoreMasterCode: InstoreMasterCode = watch('codeMaster');

  /**
   * Reload data cash register type when add data SC7102 success
   */
  useEffect(() => {
    if (settingMasterState?.needReloadCashRegisterType) {
      dispatch(settingMasterSlice.actions.setReloadCashRegisterType(false));
      dispatch(getMasters({ master_code: LIST_MASTER_CODE }));
    }
  }, []);

  const getDataCashRegister = () => {
    dispatch(
      getCashRegister({
        ...settingMasterState.search_cash_machine,
        selected_store: selectedStores,
      })
    )
      .unwrap()
      .then(() => {
        settingMasterSlice.actions.handleClearSelectedRow();
        handleFocusInput();
        handleResetSelected();
      })
      .catch(() => {});
  };

  // define function api get preset layout
  const handleGetPresetCashMachine = (listStore: string[]) => {
    dispatch(getPresetsCashMachine({ selected_stores: listStore }));
  };

  // define function call api get master code
  const handleGetMaster = () => {
    dispatch(getMasters({ master_code: LIST_MASTER_CODE }))
      .unwrap()
      .catch((error) => {
        console.error(`Can't fetch master code`, error);
      });
  };

  // function call api preset layout and master code
  const getDataMaster = (storeCodes: string[]) => {
    if (isNullOrEmpty(storeCodes)) {
      onCloseSideBar(true);
      return;
    }

    onCloseSideBar(false); // close sidebar
    dispatch(actionSideBar.clearDataSearch(storeCodes)); // clear data search
    handleGetPresetCashMachine(storeCodes); // preset layout
    handleGetMaster(); // master code
    handleFocusInput(); // focus input
  };

  useEffect(() => {
    if (!settingMasterState.save_success) return;
    if (selectedStores?.length > 0) {
      dispatch(
        getCashRegister({
          ...settingMasterState.search_cash_machine,
          selected_store: selectedStores,
        })
      );
    } else {
      clearData();
    }
    dispatch(actionSideBar.setSaveSuccess(false));
    dispatch(actionSideBar.handleClearSelectedRow());
  }, []);

  useEffect(() => {
    if (isNullOrEmpty(selectedStores)) {
      dispatch(settingMasterSlice.actions.clearDataSearch(selectedStores));
      dispatch(selectAllStore(false));
      dispatch(settingMasterSlice.actions.clearScreenData());
      return;
    }

    getDataMasterWhenHasOneStore();
  }, []);

  useEffect(() => {
    if (navigationType !== Action.Pop) {
      clearData();
      if (stores?.length === 1) {
        getDataMaster([stores[0].store_code]);
      }
      return;
    }

    // When have data changed, go to SC7102 and go back SC7101 => reload data cash register
    if (settingMasterState.reloadData) {
      getDataCashRegister();
      dispatch(settingMasterSlice.actions.setReloadData(false));
    }
  }, [navigationType]);

  const clearData = () => {
    dispatch(settingMasterSlice.actions.clearScreenData());
    dispatch(settingMasterSlice.actions.clearDataSearch([]));
  };

  const getDataMasterWhenHasOneStore = () => {
    if (stores?.length === 1 && !settingMasterState.preset_layouts && !settingMasterState.cash_register_type) {
      getDataMaster([stores[0].store_code]);
    }
  };

  return (
    <div className="setting-mater__search">
      <SidebarStore
        selectMultiple={true}
        actionConfirm={getDataMaster}
        hasData={settingMasterState.data_table_cash_registers?.length > 0 || noData}
        clearData={clearData}
        disabledSearch={disabledSearch}
        confirmChange={confirmChange}
        dataSearchChange={settingMasterState.search_cash_machine}
        expanded={true}
      />

      {/* Start row 1 */}
      <div className="setting-mater__search-container">
        <div className="setting-mater__search-content">
          <InputTextCustom
            id="register-number"
            labelText="settingMaster.sidePanel.cashMachineNo"
            value={settingMasterState.search_cash_machine?.cash_machine_no || ''}
            maxLength={4}
            type="number"
            disabled={disabledSearch}
            onChange={(e: any) => dispatch(actionSideBar.handleSelectCashMachineNo(e.target?.value))}
          />
          <Dropdown
            hasBlankItem={true}
            className="setting-mater__search-cash-machine-type"
            label="settingMaster.sidePanel.cashMachineType"
            items={instoreMasterCode.instoreTypes}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectCashMachineType(item?.value))}
            value={settingMasterState.search_cash_machine?.cash_machine_type}
          />
          <Dropdown
            hasBlankItem={true}
            className="setting-mater__search-preset-layout"
            label="settingMaster.sidePanel.presetLayout"
            items={createDropdownListCustom(
              settingMasterState?.preset_layouts,
              (item) => item.preset_layout_code ?? '',
              (item) => item.preset_layout_name ?? ''
            )}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectPresetLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.preset_layout_id}
          />
        </div>
        {/* End row 1 */}

        {/* Start row 2 */}
        <div className="setting-mater__search-content">
          {/* Type node - MC7102 */}
          <Dropdown
            className="setting-mater__search-note-type"
            label="settingMaster.sidePanel.noteType"
            items={instoreMasterCode.noteTypes}
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectNodeType(item.value))}
            value={settingMasterState.search_cash_machine?.node_type}
          />

          {/* Keyboard layout - MC7105 */}
          <Dropdown
            className="setting-mater__search-keyboard-layout"
            label="settingMaster.sidePanel.keyboardLayout"
            items={instoreMasterCode.keyboardLayouts}
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectKeyboardLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.keyboard_layout_id}
          />

          {/* Function layout - MC7104 */}
          <Dropdown
            className="setting-mater__search-function-layout"
            label="settingMaster.sidePanel.functionLayout"
            items={instoreMasterCode.functionLayouts}
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectFunctionLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.function_layout_id}
          />
        </div>
        {/* End row 2 */}
      </div>
      <FuncKeyDirtyCheckButton
        dirtyCheck={confirmChange}
        text="action.f12Search"
        okDirtyCheckAction={getDataCashRegister}
        onClickAction={getDataCashRegister}
        disabled={disabledSearch}
        funcKeyListener={settingMasterState.search_cash_machine}
      />
    </div>
  );
};

export default SettingMasterSearch;
