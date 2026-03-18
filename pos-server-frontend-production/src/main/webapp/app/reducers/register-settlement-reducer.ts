import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RegisterSettlementState {
  openBusinessDayDetailPage: string;
}

export const initialStateRegisterSettlement: RegisterSettlementState = {
  openBusinessDayDetailPage: null,
};

export const registerSettlementSlice = createSlice({
  name: 'register-settlement',
  initialState: initialStateRegisterSettlement,
  reducers: {
    handleUpdateOpenBusinessDay(state, action: PayloadAction<string>) {
      state.openBusinessDayDetailPage = action.payload;
    },
  },
});

export const { handleUpdateOpenBusinessDay } = registerSettlementSlice.actions;

export default registerSettlementSlice.reducer;
