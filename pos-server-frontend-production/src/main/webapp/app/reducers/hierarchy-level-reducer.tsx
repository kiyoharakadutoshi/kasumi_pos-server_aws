import { createSlice, isRejected } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { NOT_FOUND_CODE, NOT_FOUND_DATA } from 'app/constants/api-constants';
import { getHierarchyLevel, IHierarchyLevel } from 'app/services/hierarchy-level-service';

export interface IHierarchyLevelState {
  errorMessage: string;
  hierarchyLevel?: IHierarchyLevel;
  noResult: boolean;
}

const initialState: IHierarchyLevelState = {
  errorMessage: null,
  hierarchyLevel: null,
  noResult: false,
};

const hierarchyLevelSlice = createSlice({
  name: 'hierarchyLevel',
  initialState,
  reducers: {
    clearHierarchyMessageError(state) {
      state.errorMessage = null;
    },
    clearHierarchyLevel(state) {
      state.hierarchyLevel = null;
      state.noResult = false;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getHierarchyLevel.fulfilled, (state, action) => {
        state.hierarchyLevel = action.payload.data.data;
        state.noResult = action.payload.data.data?.items?.length === 0;
        const keys = Object.keys(action.payload.config.params);
        if (keys?.includes('filter_code')) {
          if (action.payload.data.data?.items?.length > 0) {
            state.errorMessage = null;
            return;
          }
          state.errorMessage = NOT_FOUND_DATA;
          state.noResult = false;
        }
      })
      .addMatcher(isRejected(getHierarchyLevel), (state, action) => {
        const error = action.error as AxiosError;
        state.noResult = true;
        const keys = Object.keys(error.config.params);
        if (keys?.includes('filter_code')) {
          state.errorMessage = (action.error as AxiosError).response?.status === NOT_FOUND_CODE ? NOT_FOUND_DATA : action.error.message;
          return;
        }
      });
  },
});

export const { clearHierarchyMessageError, clearHierarchyLevel } = hierarchyLevelSlice.actions;

export default hierarchyLevelSlice.reducer;
