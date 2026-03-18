import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ErrorState {
  message: string | null;
  isError: boolean;
  paramValidate?: string;
  onCloseModal: boolean
}

export interface MessageValidate {
  param?: string;
  message?: string;
}

const initialState: ErrorState = {
  message: null,
  isError: false,
  paramValidate: null,
  onCloseModal: false
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setParamValidate(state, action: PayloadAction<string>) {
      state.paramValidate = action.payload;
    },

    setErrorValidate(state, action: PayloadAction<MessageValidate>) {
      state.message = action.payload.message;
      state.paramValidate = action.payload.param;
      state.isError = true;
    },

    setError(state, action: PayloadAction<string>) {
      state.message = action.payload;
      state.paramValidate = null;
      state.isError = true;
    },

    clearError(state) {
      state.message = null;
      state.isError = false;
      state.paramValidate = null;
    },

    setCloseModal(state, action) {
      state.onCloseModal = action.payload;
    }
  },
});

export const { setError, clearError, setErrorValidate, setCloseModal } = errorSlice.actions;

export default errorSlice.reducer;
