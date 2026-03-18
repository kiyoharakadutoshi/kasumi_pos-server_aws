import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GROUP_STORE_MASTER_CODE, GROUP_STORES, STORE_USER } from 'app/constants/constants';
import { getListStore } from 'app/services/store-service';
import { Storage } from 'react-jhipster';
import { getMasters } from 'app/services/master-service';
import { IDropDownItem } from 'app/components/dropdown/dropdown';

export interface IStoreSate {
  stores: IStoreInfo[];
  selectedStores: string[];
  storeDefault?: IStoreInfo;
  applyStores?: IStoreInfo[];
  registeredStores?: IStoreInfo[];
  group_stores?: IDropDownItem[];
}

export interface IStoreInfo {
  store_code: string;
  store_name: string;
  business_type_code?: string;
  short_name?: string;
  post_code?: string;
  address?: string;
  phone_number?: string;
  start_hours?: string;
  end_hours?: string;
  default_point?: number;
  isDefault?: boolean;
  selected?: boolean;
}

const initialState: IStoreSate = {
  stores: [],
  selectedStores: [],
  storeDefault: null,
  applyStores: [],
  registeredStores: [],
  group_stores: null,
};

const StoreSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setupStore(state) {
      state.stores = Storage.local?.get(STORE_USER);
      if (state.stores?.length === 1) {
        state.stores[0].selected = true;
        state.selectedStores = [state.stores[0].store_code];
      } else {
        state.selectedStores = [];
      }
      state.applyStores = state.stores;
      state.group_stores = Storage.local?.get(GROUP_STORES);
    },

    updateSelectedStore(state, action: PayloadAction<string>) {
      const index = state.stores?.findIndex(item => item.store_code === action.payload);
      if (index >= 0) {
        state.stores[index].selected = !state.stores[index].selected;
      }
    },

    selectSingleStore(state, action: PayloadAction<string>) {
      state.stores.forEach(store => (store.selected = store.store_code === action.payload));
    },

    selectAllStore(state, action: PayloadAction<boolean>) {
      state.stores.forEach(store => (store.selected = action.payload));
    },

    clearData(state) {
      state.applyStores = null;
    },

    resetSelectedStore(state) {
      state.stores = state.stores.map(item => ({
        ...item,
        selected: state.selectedStores?.includes(item.store_code),
      }));
    },

    setApplyStores(state, action: PayloadAction<IStoreInfo[]>) {
      state.applyStores = action.payload;
      state.registeredStores = state.stores.filter(store =>
        action.payload.some(applyStore => applyStore.selected && applyStore.store_code === store.store_code),
      );
    },

    setSelectedStore(state, action: PayloadAction<string[]>) {
      state.selectedStores = action.payload;
    },

    selectStore(state, action: PayloadAction<string>) {
      state.selectedStores = [action.payload];
      state.stores.forEach(store => (store.selected = store.store_code === action.payload));
    },

    clearSelectedStores(state) {
      if (state.stores?.length > 1) {
        state.stores.forEach(store => (store.selected = false));
        state.selectedStores = [];
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getListStore.fulfilled, (state, action) => {
        state.stores = action.payload.data.data.items;
        state.applyStores = state.stores;
        Storage.local?.set(STORE_USER, action.payload.data.data.items);
        if (state.stores?.length === 1) {
          state.stores[0].selected = true;
          state.selectedStores = [state.stores[0].store_code];
        } else {
          state.selectedStores = [];
        }
      })
      .addCase(getMasters.fulfilled, (state, action) => {
        if (action.payload?.config?.data?.includes(GROUP_STORE_MASTER_CODE)) {
          const groupStores: IDropDownItem[] = action.payload.data.data
            .find(item => item.master_code === GROUP_STORE_MASTER_CODE)
            ?.items?.map(item => ({
              value: item.setting_data_type,
              code: item.setting_data_type,
              name: item.event_group_name,
            }));
          state.group_stores = groupStores;
          Storage.local.set(GROUP_STORES, groupStores);
        }
      });
  },
});

export const {
  setApplyStores,
  updateSelectedStore,
  selectAllStore,
  setupStore,
  selectSingleStore,
  setSelectedStore,
  resetSelectedStore,
  clearSelectedStores,
  selectStore
} = StoreSlice.actions;

export default StoreSlice.reducer;
