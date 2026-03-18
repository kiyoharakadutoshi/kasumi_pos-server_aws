/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  IMasterStores,
  masterStoreSearchConditionInit,
  MasterStoreState,
  IMasterStoresResponse,
  masterStoreSaveConditionInit,
} from 'app/modules/master-stores/master-stores-interface';
import { createSlice, isRejected, PayloadAction } from '@reduxjs/toolkit';
import { OperationType, SelectedRow } from 'app/components/table/table-common';
import { getListMasterStores, saveMasterStores } from 'app/services/master-stores-service';

const initialState: MasterStoreState = {
  masterStoresList: [],
  saveDataSuccess: false,
  masterStoreSearchCondition: masterStoreSearchConditionInit,
  masterStoreSaveCondition: masterStoreSaveConditionInit,
  masterStoreSelected: null,
  noData: false,
  isExisted: false,
};

const masterStoresSlice = createSlice({
  name: 'master-store',
  initialState,
  reducers: {
    addListMasterStores(state, action: PayloadAction<IMasterStores[]>) {
      state.masterStoresList = action.payload;
    },

    addStore(state, action: PayloadAction<IMasterStores>) {
      state.masterStoresList = [action.payload, ...state.masterStoresList];
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    },

    editStore(state, action: PayloadAction<IMasterStores>) {
      const index = state.masterStoreSelected?.index;
      if (index >= 0 && index < state.masterStoresList.length) {
        state.masterStoresList[index] = action.payload;
        state.masterStoreSelected.row = action.payload;
      }
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    },

    deleteSelectedMasterStores(state) {
      const index = state.masterStoreSelected?.index;
      if (index >= 0 && index < state.masterStoresList.length) {
        const masterStore = state.masterStoresList[index];
        masterStore.operation_type =
          masterStore.operation_type !== OperationType.Remove
            ? OperationType.Remove
            : masterStore.operation_type_before;
        state.masterStoreSelected.row = state.masterStoresList[index];
      }
    },

    selectMasterStores(state, action: PayloadAction<SelectedRow>) {
      state.masterStoreSelected = action.payload;
    },

    updateIsExisted(state, action: PayloadAction<boolean>) {
      state.isExisted = action.payload;
    },

    handleChangeCode(state, action: PayloadAction<string>) {
      state.masterStoreSearchCondition.code = action.payload;
    },

    handleChangeCodeType(state, action: PayloadAction<number>) {
      state.masterStoreSearchCondition.code_filter_type = action.payload;
    },

    handleChangeName(state, action: PayloadAction<string>) {
      state.masterStoreSearchCondition.name = action.payload;
    },

    handleChangeNameType(state, action: PayloadAction<number>) {
      state.masterStoreSearchCondition.name_filter_type = action.payload;
    },

    handleChangeStoreType(state, action: PayloadAction<number>) {
      state.masterStoreSearchCondition.store_type = action.payload;
    },
    // handle change condition for save , edit masterStore
    handleChangeCodeCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.code = action.payload;
    },
    handleChangeNameCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.name = action.payload;
    },
    handleChangeShortNameCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.short_name = action.payload;
    },
    handleChangePostCodeCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.post_code = action.payload;
    },
    handleChangeAddressCondition(state, action: PayloadAction<{ fieldName: string; value: string }>) {
      state.masterStoreSaveCondition[action.payload.fieldName] = action.payload.value;
    },
    handleChangePhoneCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.phone_number = action.payload;
    },
    handleChangeBusinessTypeCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.business_type_code = action.payload;
    },
    handleChangeDefaultPointCondition(state, action: PayloadAction<number>) {
      state.masterStoreSaveCondition.default_point = action.payload;
    },
    handleChangeStartTimeCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.start_hours = action.payload;
    },
    handleChangeEndTimeCondition(state, action: PayloadAction<string>) {
      state.masterStoreSaveCondition.end_hours = action.payload;
    },
    //handle clear data
    handleClearSearchCondition(state) {
      state.masterStoreSearchCondition = masterStoreSearchConditionInit;
    },
    handleClearSaveCondition(state) {
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    },
    handleClearMasterStoresList(state) {
      state.masterStoresList = [];
      state.noData = false;
    },
    handleClearSelected(state) {
      state.masterStoreSelected = null;
    },
  },

  extraReducers(builder) {
    builder.addCase(getListMasterStores.fulfilled, (state, action) => {
      state.masterStoresList = action.payload.data?.data.store_list;

      if (action.payload.data?.data.store_list?.length === 0 || !action.payload.data?.data.store_list) {
        state.noData = true;
      } else {
        state.noData = false;
      }

      state.masterStoreSelected = null;
      // refresh isExisted because get list running after add or edit
      state.isExisted = false;
    });

    builder.addCase(saveMasterStores.fulfilled, (state, action) => {
      state.saveDataSuccess = true;
      state.masterStoreSelected = null;
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    });
  },
});

export const {
  addStore,
  editStore,
  selectMasterStores,
  handleChangeCode,
  handleChangeCodeType,
  handleChangeName,
  handleChangeNameType,
  handleChangeStoreType,
  addListMasterStores,
  handleChangeAddressCondition,
  handleChangeBusinessTypeCondition,
  handleChangeCodeCondition,
  handleChangeEndTimeCondition,
  handleChangeNameCondition,
  handleChangePhoneCondition,
  handleChangePostCodeCondition,
  handleChangeShortNameCondition,
  handleChangeStartTimeCondition,
  handleChangeDefaultPointCondition,
  handleClearSaveCondition,
  handleClearSearchCondition,
  handleClearMasterStoresList,
  handleClearSelected,
  deleteSelectedMasterStores,
} = masterStoresSlice.actions;

export default masterStoresSlice.reducer;
