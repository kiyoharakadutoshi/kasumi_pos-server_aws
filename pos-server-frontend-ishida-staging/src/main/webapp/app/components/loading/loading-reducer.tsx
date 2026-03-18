import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isNullOrEmpty } from '../../helpers/utils';

export interface LoadingState {
  isLoading: boolean;
  ongoingCalls: string[];
  runBackground?: boolean;
}

interface LoadingInput {
  runBackground?: boolean;
  type?: string;
}

const initialState: LoadingState = {
  isLoading: false,
  ongoingCalls: [],
  runBackground: false,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    showLoading(state, action?: PayloadAction<LoadingInput>) {
      state.isLoading = true;
      if (!isNullOrEmpty(action.payload.type)) {
        state.ongoingCalls.push(action.payload.type);
      }
      state.runBackground = action?.payload.runBackground;
    },

    hideLoading(state, action?: PayloadAction<LoadingInput>) {
      state.ongoingCalls = state.ongoingCalls.filter(call => call !== action.payload.type);
      if (action?.payload.runBackground || state.ongoingCalls.length === 0) {
        state.isLoading = false;
        state.runBackground = false;
      }
    },

    removeOngoingCalls(state, action?: PayloadAction<LoadingInput>) {
      state.ongoingCalls = state.ongoingCalls.filter(call => call !== action.payload.type);
    }
  },
});

export const { showLoading, hideLoading, removeOngoingCalls } = loadingSlice.actions;
export default loadingSlice.reducer;
