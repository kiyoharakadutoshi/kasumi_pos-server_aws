import { createSlice, isFulfilled, isRejected } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { NOT_FOUND_CODE } from 'app/constants/api-constants';
import { IProduct, suggestProduct } from 'app/services/product-service';
import { localizeString } from 'app/helpers/utils';
import { ProductResponse } from '@/modules/touch-menu/detail/interface-preset';

export interface ProductSate {
  loading: boolean;
  errorMessage: string;
  product?: ProductResponse;
  product1506?: IProduct;
}

const initialState: ProductSate = {
  loading: false,
  errorMessage: null,
  product: null,
  product1506: null,
};

const productSlice = createSlice({
  name: 'suggest',
  initialState,
  reducers: {
    clearMessageError(state) {
      state.errorMessage = null;
    },
    clearDataProduct(state) {
      state.product = null;
      state.product1506 = null;
    },
  },
  extraReducers(builder) {
    builder
      .addMatcher(isFulfilled(suggestProduct), (state, action) => {
        state.loading = false;
        state.product1506 = action.payload.data?.data;
        state.errorMessage = null;
      })
      .addMatcher(isRejected(suggestProduct), (state, action) => {
        const response = (action.error as AxiosError).response;
        state.product1506 = response?.status === NOT_FOUND_CODE ? { description: localizeString('MSG_ERR_001') } : null;
      })
  },
});

export const { clearMessageError, clearDataProduct } = productSlice.actions;

export default productSlice.reducer;
