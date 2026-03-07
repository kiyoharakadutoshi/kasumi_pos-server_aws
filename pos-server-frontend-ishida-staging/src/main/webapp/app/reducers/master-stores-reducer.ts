/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  IMasterStoreRecord,
  masterStoreSearchConditionInit,
  MasterStoreState,
  masterStoreSaveConditionInit,
  IMasterStoreSearchCondition,
  BusinessTypeName,
} from 'app/modules/master-stores/master-stores-interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OperationType, SelectedRow } from 'app/components/table/table-common';
import { getListMasterStores, saveMasterStores } from 'app/services/master-stores-service';

const initialState: MasterStoreState = {
  masterStoresList: [],
  masterStoreListDefault: [],
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
    getBusinessTypeName(state, action: PayloadAction<BusinessTypeName[]>) {
      state.businessTypeName = action.payload;
    },

    addListMasterStores(state, action: PayloadAction<IMasterStoreRecord[]>) {
      state.masterStoresList = action.payload;
    },

    addListMasterStoresDefault(state, action: PayloadAction<IMasterStoreRecord[]>) {
      state.masterStoreListDefault = action.payload;
    },

    addStore(state, action: PayloadAction<IMasterStoreRecord>) {
      state.masterStoresList = [
        {
          ...action.payload,
        },
        ...state.masterStoresList,
      ];
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    },

    editStore(state, action: PayloadAction<IMasterStoreRecord>) {
      const index = state.masterStoreSelected?.index;
      if (index >= 0 && index < state.masterStoresList.length) {
        state.masterStoresList[index] = {
          record_id: state.masterStoresList[index].record_id,
          ...action.payload,
        };
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

    handleChangeSearchConditionField<T extends keyof IMasterStoreSearchCondition>(
      state,
      action: PayloadAction<{ key: T; value: IMasterStoreSearchCondition[T] }>
    ) {
      state.masterStoreSearchCondition[action.payload.key] = action.payload.value;
    },
    // Data form
    handleChangeDataForm<T extends keyof IMasterStoreRecord>(
      state,
      action: PayloadAction<{ key: keyof IMasterStoreRecord; value: IMasterStoreRecord[T] }>
    ) {
      state.masterStoreSaveCondition[action.payload.key] = action.payload.value;
    },
    // Handle clear data
    handleClearSearchCondition(state) {
      state.masterStoreSearchCondition = masterStoreSearchConditionInit;
    },
    handleClearSaveCondition(state) {
      state.masterStoreSaveCondition = masterStoreSaveConditionInit;
    },
    handleClearListStoreDefault(state) {
      state.masterStoreListDefault = [];
    },
    handleClearMasterStoresList(state) {
      state.masterStoresList = [];
      state.noData = false;
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

    builder.addCase(saveMasterStores.fulfilled, (state) => {
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
  handleChangeSearchConditionField,
  handleChangeDataForm,
  addListMasterStores,
  addListMasterStoresDefault,
  handleClearListStoreDefault,
  getBusinessTypeName,
  // action clear
  handleClearSaveCondition,
  handleClearSearchCondition,
  handleClearMasterStoresList,
  // Action bottom button
  deleteSelectedMasterStores,
} = masterStoresSlice.actions;

export default masterStoresSlice.reducer;
