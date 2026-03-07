import { createSlice } from '@reduxjs/toolkit';
import { getListPromotion, IPromotionDetail } from 'app/services/promotion-service';
import { LIMIT_RECORD } from 'app/constants/constants';

export interface IPromotionState {
  isExceedRecords?: boolean;
  promotions?: IPromotionDetail[];
  noResult: boolean;
}

const initialState: IPromotionState = {
  promotions: null,
  noResult: false,
};

const promotionSlice = createSlice({
  name: 'hierarchyLevel',
  initialState,
  reducers: {
    clearListPromotion(state) {
      state.promotions = null;
      state.noResult = false;
      state.isExceedRecords = false;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getListPromotion.fulfilled, (state, action) => {
        state.promotions = action.payload.data.data?.items;
        state.isExceedRecords = action.payload.data.data?.total_promotion > LIMIT_RECORD;
        state.promotions?.forEach(promotion => {
          promotion.start_date_time = `${promotion.start_date?.slice(2)} ${promotion.start_time}`;
          promotion.end_date_time = `${promotion.end_date?.slice(2)} ${promotion.end_time}`;
        });
        state.noResult = action.payload.data?.data?.items?.length === 0;
      })
      .addCase(getListPromotion.rejected, state => {
        state.noResult = true;
        state.promotions = null;
        state.isExceedRecords = false;
      });
  },
});

export const { clearListPromotion } = promotionSlice.actions;

export default promotionSlice.reducer;
