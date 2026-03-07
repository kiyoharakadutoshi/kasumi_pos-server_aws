import { createSlice } from '@reduxjs/toolkit';

export interface ConfirmState {
  message?: string | null;
  action?: any;
}

const initialState: ConfirmState = {
  message: null,
  action: null,
};

const confirmSlice = createSlice({
  name: 'confirm',
  initialState,
  reducers: {
    navigateTo(state, action?) {
      state.message = 'MSG_CONFIRM_002';
      state.action = action.payload ?? '/';
    },

    closeConfirm(state) {
      state.message = null;
      state.action = null;
    },
  },
});

export const { navigateTo, closeConfirm } = confirmSlice.actions;

export default confirmSlice.reducer;
