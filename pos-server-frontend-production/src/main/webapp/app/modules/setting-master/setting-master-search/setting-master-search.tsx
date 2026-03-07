import './../master-home.scss';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { settingMasterSlice, SettingMasterState } from 'app/reducers/setting-master-reducer';
import { getCashRegister, getCashRegisterType, getPresetsCashMachine } from 'app/services/setting-master-service';
import { postMessageMaster } from 'app/services/message-service';
import { createDropdownListCustom, isNullOrEmpty } from 'app/helpers/utils';
import { getMasters } from 'app/services/master-service';
import { IStoreInfo, selectAllStore } from 'app/reducers/store-reducer';
import { IMasterCode } from 'app/reducers/master-reducer';
import { useNavigationType } from 'react-router';
import Dropdown from 'app/components/dropdown/dropdown';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import { clickButtonSearch } from 'app/components/sidebar-store-default/sidebar-store-default';
import { Action } from '@remix-run/router';
import { CompanyInfo } from 'app/reducers/user-login-reducer';

const SettingMasterSearch = ({
  confirmChange,
  disabledSearch,
  onCloseSideBar,
}: {
  confirmChange?: boolean;
  disabledSearch?: boolean;
  onCloseSideBar?: (disableSearch: boolean) => void;
}) => {
  const dispatch = useAppDispatch();
  const settingMasterState: SettingMasterState = useAppSelector(state => state.settingMasterReducer);
  const masters: IMasterCode[] = settingMasterState?.masters;
  const actionSideBar = settingMasterSlice.actions;
  const selectedStores: string[] = useAppSelector(state => state.storeReducer.selectedStores);
  const stores: IStoreInfo[] = useAppSelector(state => state.storeReducer.stores);
  const masterMC7101 = masters?.find(master => master.master_code === 'MC7101')?.items;
  const masterMC7102 = masters?.find(master => master.master_code === 'MC7102')?.items;
  const masterMC7103 = masters?.find(master => master.master_code === 'MC7103')?.items;
  const company: CompanyInfo = useAppSelector(state => state.loginReducer.selectedCompany);
  const noData = useAppSelector(state => state.settingMasterReducer.noData);

  const navigationType = useNavigationType();

  /**
   * Reload data cash register type when add data SC7102 success
   */
  useEffect(() => {
    if (settingMasterState?.needReloadCashRegisterType) {
      dispatch(settingMasterSlice.actions.setReloadCashRegisterType(false));
      dispatch(getCashRegisterType(null));
    }
  }, []);

  const getDataCashRegister = () => {
    dispatch(
      getCashRegister({
        ...settingMasterState.search_cash_machine,
        selected_store: selectedStores,
      }),
    );
  };

  const getDataMaster = (storeCodes: string[]) => {
    if (isNullOrEmpty(storeCodes)) {
      onCloseSideBar(true);
      return;
    }

    onCloseSideBar(false);
    handleCallApiMaster(storeCodes);
  };

  const handleCallApiMaster = (listStore: string[]) => {
    dispatch(actionSideBar.clearDataSearch(listStore));
    dispatch(getPresetsCashMachine({ selected_stores: listStore }));
    dispatch(getCashRegisterType(null));

    if (!company?.settingMaster) {
      dispatch(postMessageMaster({ selected_stores: listStore, type: 1 }));
      dispatch(getMasters({ master_code: ['MC7101', 'MC7102', 'MC7103'] }));
    }
  };

  useEffect(() => {
    if (!settingMasterState.save_success) return;
    if (selectedStores?.length > 0) {
      dispatch(
        getCashRegister({
          ...settingMasterState.search_cash_machine,
          selected_store: selectedStores,
        }),
      );
    } else {
      clearData();
    }
    dispatch(actionSideBar.setSaveSuccess(false));
    dispatch(actionSideBar.handleSelectedCashRegister(null));
  }, [settingMasterState.save_success]);

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
  }

  return (
    <div className="setting-mater__search">
      <SidebarStore
        onClickSearch={getDataCashRegister}
        selectMultiple={true}
        actionConfirm={getDataMaster}
        hasData={settingMasterState.data_table_cash_registers?.length > 0 || noData}
        clearData={clearData}
        disabledSearch={disabledSearch}
        confirmChange={confirmChange}
        dataSearchChange={settingMasterState.search_cash_machine}
        expanded={true}
      />
      <div className="setting-mater__search-container">
        <div className="setting-mater__search-content">
          <InputTextCustom
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
            items={createDropdownListCustom(
              settingMasterState?.cash_register_type,
              item => item?.code || '',
              item => item.name || '',
            )}
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
              item => item.preset_layout_code || '',
              item => item.preset_layout_name || '',
            )}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectPresetLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.preset_layout_id}
          />
        </div>
        <div className="setting-mater__search-content">
          <Dropdown
            className="setting-mater__search-note-type"
            label="settingMaster.sidePanel.noteType"
            items={
              company?.settingMaster?.nodeType?.dropdownValues ??
              createDropdownListCustom(
                masterMC7101,
                item => item.setting_data_type || '',
                item => item.event_group_name || '',
              )
            }
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectNodeType(item.value))}
            value={settingMasterState.search_cash_machine?.node_type}
          />
          <Dropdown
            className="setting-mater__search-keyboard-layout"
            label="settingMaster.sidePanel.keyboardLayout"
            items={
              company?.settingMaster?.keyboardLayout?.dropdownValues ??
              createDropdownListCustom(
                masterMC7103,
                item => item.setting_data_type || '',
                item => item.event_group_name || '',
              )
            }
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectKeyboardLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.keyboard_layout_id}
          />
          <Dropdown
            className="setting-mater__search-function-layout"
            label="settingMaster.sidePanel.functionLayout"
            items={
              company?.settingMaster?.functionLayout?.dropdownValues ??
              createDropdownListCustom(
                masterMC7102,
                item => item.setting_data_type || '',
                item => item.event_group_name || '',
              )
            }
            hasBlankItem={true}
            disabled={disabledSearch}
            onChange={(item: any) => dispatch(actionSideBar.handleSelectFunctionLayout(item?.value))}
            value={settingMasterState.search_cash_machine?.function_layout_id}
          />
        </div>
      </div>
      <ButtonPrimary text="action.f12Search" onClick={clickButtonSearch} disabled={disabledSearch} />
    </div>
  );
};

export default SettingMasterSearch;
