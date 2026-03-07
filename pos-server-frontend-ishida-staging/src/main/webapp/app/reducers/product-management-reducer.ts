import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMixMatchSpecialPrice } from 'app/modules/product-management/product-management-interface';
import { getListMixMatchsSpecialPrice, IProduct, suggestProduct } from 'app/services/product-service';
import { Row } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { NOT_FOUND_CODE } from 'app/constants/api-constants';
import { localizeString } from 'app/helpers/utils';

export interface ProductManagementState {
  mixMatchsSpecialPrice: IMixMatchSpecialPrice[];
  is_exceed_records?: boolean;
  showNoData?: boolean;
  selectedRows?: Row<IMixMatchSpecialPrice>[];
  reloadData?: boolean;
  suggestedProduct?: IProduct;
}

const initialState: ProductManagementState = {
  mixMatchsSpecialPrice: null,
  selectedRows: null,
  reloadData: null,
};

const productManagementSlice = createSlice({
  name: 'product-management',
  initialState,
  reducers: {
    clearDataMixMatchsSpecialPrice(state) {
      state.showNoData = null;
      state.is_exceed_records = null;
      state.mixMatchsSpecialPrice = null;
      state.selectedRows = null;
      state.reloadData = false;
      state.suggestedProduct = null;
    },
    setSelectedRows(state, action: PayloadAction<Row<IMixMatchSpecialPrice>[]>) {
      state.selectedRows = action.payload;
    },
    clearSelectedRow(state) {
      state.selectedRows = null;
    },
    updateMyCompanyCode(state, action: PayloadAction<string>) {
      state.suggestedProduct.my_company_code = action.payload;
    },
    setReloadDataProduct(state, action: PayloadAction<boolean>) {
      state.reloadData = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getListMixMatchsSpecialPrice.fulfilled, (state, action) => {
        const data = action.payload.data.data;
        state.showNoData = false;
        state.mixMatchsSpecialPrice = data?.items ?? [];
        state.is_exceed_records = false;
      })
      .addCase(suggestProduct.fulfilled, (state, action) => {
        const data = action.payload.data.data;
        state.suggestedProduct = action.payload.data?.data;
        if (!data) {
          state.mixMatchsSpecialPrice = [];
        }
      })
      .addCase(getListMixMatchsSpecialPrice.rejected, (state) => {
        state.showNoData = true;
        state.mixMatchsSpecialPrice = [];
      })
      .addCase(suggestProduct.rejected, (state, action) => {
        state.mixMatchsSpecialPrice = [];
        const response = (action.error as AxiosError).response;
        state.suggestedProduct =
          response?.status === NOT_FOUND_CODE ? { description: localizeString('MSG_ERR_001') } : null;
      });
  },
});

export const {
  clearDataMixMatchsSpecialPrice,
  setSelectedRows,
  clearSelectedRow,
  setReloadDataProduct,
  updateMyCompanyCode,
} = productManagementSlice.actions;

export default productManagementSlice.reducer;
