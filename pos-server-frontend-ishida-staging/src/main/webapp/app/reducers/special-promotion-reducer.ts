import {
  getDetailPromotion,
  getListSpecialPromotion,
  IPromotionDetail,
  ISpecialPromotionResponse,
  SpecialPromotionSearchKey,
  updateListSpecialPromotion,
} from 'app/services/promotion-service';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  isEqual,
  isEqualObject,
  isNullOrEmpty,
  localizeString,
  parseDataResponseErrorValidate,
} from 'app/helpers/utils';
import {
  addPromotions,
  applyPromotionInit,
  IApplyPromotionState,
  IApplyTimeService,
  initSpecialPromotion,
  ISpecialPromotion,
  ISpecialPromotionError,
  ISpecialPromotionSearchState,
  keyPromotionsCheck,
  promotionInit,
  TStatus,
} from 'app/modules/special-promotion/interface/special-sale-interface';
import { TSortType } from 'app/components/table/table-data/interface-table';
import { IProduct, suggestProduct, TSuggestProductParam } from 'app/services/product-service';
import { AxiosError } from 'axios';
import { NOT_FOUND_CODE } from 'app/constants/api-constants';
import { OperationType } from 'app/components/table/table-common';

export interface SpecialPromotionState {
  promotion: ISpecialPromotionResponse;
  promotionItemsDefault?: ISpecialPromotion[];
  suggestedPromotion?: IPromotionDetail;
  indexSuggestProduct?: number;
  applyAll: IApplyPromotionState;
  searchState: ISpecialPromotionSearchState;
  reloadToggle: boolean;
  errorSpecialPromotions?: ISpecialPromotionError[];
  errorsAPIValidate?: ISpecialPromotionError[];
  modeSearch?: boolean;
  length?: number;
}

export const initialState: SpecialPromotionState = {
  promotion: promotionInit,
  promotionItemsDefault: addPromotions(),
  suggestedPromotion: null,
  indexSuggestProduct: null,
  applyAll: applyPromotionInit(null, null),
  searchState: { sort_column: null, sort_value: 'ASC' },
  reloadToggle: false,
  errorSpecialPromotions: null,
  errorsAPIValidate: null,
  modeSearch: false,
  length: 0
};

const specialPromotionSlice = createSlice({
  name: 'specialPromotion',
  initialState,
  reducers: {
    clearData(state, action: PayloadAction<{ startTime?: string; endTime?: string }>) {
      state.promotion = promotionInit;
      state.suggestedPromotion = null;
      state.indexSuggestProduct = null;
      state.applyAll = applyPromotionInit(action.payload?.startTime, action.payload?.endTime);
      state.searchState = { sort_column: null, sort_value: 'ASC' };
      state.reloadToggle = !state.reloadToggle;
      state.errorSpecialPromotions = null;
      state.errorsAPIValidate = null;
      state.modeSearch = false;
      state.length = 0;
    },

    clearSpecialPromotion(state) {
      state.promotion = promotionInit;
      state.reloadToggle = !state.reloadToggle;
      state.errorSpecialPromotions = null;
      state.errorsAPIValidate = null;
      state.indexSuggestProduct = null;
      state.modeSearch = false;
      state.length = 0;
    },

    clearDataSearch(state, action: PayloadAction<any>) {
      const query = action.payload;
      if (isNullOrEmpty(query?.promotion_code)) {
        state.suggestedPromotion = null;
        state.searchState = { sort_column: null, sort_value: 'ASC' };
      }

      state.promotion.items[0] = state.promotionItemsDefault?.[0];
      state.indexSuggestProduct = null;
      state.reloadToggle = !state.reloadToggle;
      state.errorSpecialPromotions = null;
      state.errorsAPIValidate = null;
      state.modeSearch = false;
      state.length = 0;
    },

    clearDataAddProductOrPLU(state) {
      state.promotion.items = state.promotion.items.map((item) => {
        if (!item.record_id) {
          if (isNullOrEmpty(item.my_company_code) || isNullOrEmpty(item.item_code)) {
            return initSpecialPromotion(item.store_code);
          }
        }

        return item;
      });
    },

    clearSpecialPromotionAtIndex(state, action: PayloadAction<number>) {
      const item = state.promotion.items[action.payload];
      if (isNullOrEmpty(item.item_code) || isNullOrEmpty(item.my_company_code)) {
        state.promotion.items[action.payload] = initSpecialPromotion(item.store_code);
      }
    },

    applyAllStatus(state, action: PayloadAction<TStatus>) {
      if (!state.promotion || !state.promotion.items) return;
      state.promotion.items.forEach((item, index) => {
        if (!isNullOrEmpty(item.item_code) && !isNullOrEmpty(item.my_company_code)) {
          item.status = action.payload;
          // Update operation_type if saved record changes value
          if (item.record_id) {
            const equalObject = isEqualObject(
              state.promotionItemsDefault[index],
              item,
              keyPromotionsCheck
            );
            item.operation_type = equalObject ? null : OperationType.Edit;
          }
        }
      });
    },

    applyAllTimeService(state, action: PayloadAction<IApplyTimeService>) {
      if (!state.promotion || !state.promotion.items) return;
      state.promotion.items.forEach((item, index) => {
        if (!isNullOrEmpty(item.item_code) && !isNullOrEmpty(item.my_company_code)) {
          item.type_code = action.payload.type_code;
          item.start_date = action.payload.start_date;
          item.end_date = action.payload.end_date;
          item.start_time = action.payload.start_time;
          item.end_time = action.payload.end_time;

          // Update operation_type if saved record changes value
          if (item.record_id) {
            const equalObject = isEqualObject(
              state.promotionItemsDefault[index],
              item,
              keyPromotionsCheck
            );
            item.operation_type = equalObject ? null : OperationType.Edit;
          }
        }
      });
    },

    applyAllDiscountRate(state, action: PayloadAction<string>) {
      if (!state.promotion || !state.promotion.items) return;
      state.promotion.items.forEach((item, index) => {
        if (!isNullOrEmpty(item.item_code) && !isNullOrEmpty(item.my_company_code)) {
          item.discount_value = parseInt(action.payload, 10);
          // Update operation_type if saved record changes value
          if (item.record_id) {
            const equalObject = isEqualObject(
              state.promotionItemsDefault[index],
              item,
              keyPromotionsCheck
            );
            item.operation_type = equalObject ? null : OperationType.Edit;
          }
        }
      });
    },

    addSpecialPromotion(state, action: PayloadAction<{
      product: IProduct,
      specialPrice?: string,
      discountValue?: number,
      startTime?: string,
      endTime?: string,
    }>) {
      const item = action.payload;
      state.promotion.items[0] = {
        ...state.promotion.items[0],
        record_id: item.product.record_id,
        item_code: item.product.item_code,
        my_company_code: item.product.my_company_code,
        unit_price: item.product.unit_price,
        current_price: item.product.current_price,
        item_name: item.product.description,
        status: state.applyAll?.status,
        valid: item.product.special_valid,
        start_date: state.applyAll?.start_date,
        end_date: state.applyAll?.end_date,
        start_time: item?.startTime ?? state.applyAll?.start_time,
        end_time: item?.endTime ?? state.applyAll?.end_time,
        type_code: state.applyAll?.type_code,
        special_price: item.specialPrice ?? null,
        discount_value: item.discountValue ?? null
      };
      state.promotionItemsDefault = state.promotion.items;
    },

    updateSuggestedPromotion(state, action: PayloadAction<IPromotionDetail>) {
      if (action.payload === null) {
        state.suggestedPromotion = { hasData: false, name: localizeString('MSG_ERR_001') };
      } else {
        state.suggestedPromotion = { ...action.payload, hasData: true };
        state.searchState.promotion_code = action.payload.code;
      }
    },

    setSort(state, action: PayloadAction<{ key: keyof ISpecialPromotion; value: TSortType }>) {
      state.searchState.sort_value = action.payload.value;
      state.searchState.sort_column = action.payload.key;
    },

    setErrorSpecialPromotions(state, action: PayloadAction<ISpecialPromotionError[]>) {
      state.errorSpecialPromotions = action.payload;
    },

    setApplyInfo(state, action: PayloadAction<{ key: keyof IApplyPromotionState; value: any }>) {
      state.applyAll[action.payload.key] = action.payload.value;
    },

    setPromotionCode(state, action: PayloadAction<string>) {
      state.searchState.promotion_code = action.payload;
    },

    setGroupCode(state, action: PayloadAction<string>) {
      state.searchState.md_hierarchy_code1 = action.payload;
    },

    setModeSearch(state, action: PayloadAction<boolean>) {
      state.modeSearch = action.payload;
    },

    clearPrice(state) {
      state.promotion.items[0].special_price = null;
      state.promotion.items[0].discount_value = null;
    },

    setPromotionItems(
      state,
      action: PayloadAction<{ key: keyof ISpecialPromotion; value: any; index: number }>
    ) {

      const { key, value, index } = action.payload;
      const item: any = state.promotion.items[index];
      item[key] = value;
      const itemDefault = state.promotionItemsDefault[action.payload.index];

      if (!itemDefault) {
        return;
      }

      // Reset error validate when change data
      if (state.errorSpecialPromotions?.length > index && state.errorSpecialPromotions[index]) {
        state.errorSpecialPromotions[index][key] = null;
      }

      state.promotion.items[index] = item;
      if (!item.record_id) return;

      // Update operation_type if saved record changes value
      if (!isEqual(itemDefault[key], value)) {
        item.operation_type = OperationType.Edit;
        return;
      }
      // Reset operation_type if saved record reset value
      if (isEqualObject(itemDefault, item, keyPromotionsCheck)) {
        item.operation_type = null;
      }
    },

    setIndexSuggestProduct(state, action) {
      state.indexSuggestProduct = action.payload;
    },

    resetPrice(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.promotion.items.forEach((item: ISpecialPromotion, index: number) => {
          item.special_price = state.promotionItemsDefault[index].special_price;
        });
      } else {
        state.promotion.items.forEach((item: ISpecialPromotion, index: number) => {
          item.discount_value = state.promotionItemsDefault[index].discount_value;
        });
      }
    },

    addPage(state, action) {
      state.length = 0;
      state.reloadToggle = !state.reloadToggle;
      state.promotion.items = addPromotions(0, action.payload);
      state.promotion.current_page = state.promotion.current_page + 1;
      state.promotionItemsDefault = state.promotion.items;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getListSpecialPromotion.fulfilled, (state, action) => {
        const specialPromotion = action.payload.data.data;
        state.length = specialPromotion?.items?.length;

        // When calling api update special promotion got validation error
        // Set new data without error to display
        if (!isNullOrEmpty(state.errorsAPIValidate)) {
          state.errorSpecialPromotions = state.errorsAPIValidate;
          state.errorsAPIValidate.forEach((error, index) => {
            if (!error) {
              const item = state.promotion.items[index];
              let itemExist: ISpecialPromotion;

              if (item.record_id) {
                itemExist = specialPromotion.items.find(
                  (data) => data.record_id === item.record_id
                );
              } else {
                itemExist = specialPromotion.items.find(
                  (data) => data.item_code === item.item_code && data.type_code === item.type_code
                );
              }

              if (itemExist) {
                state.promotion.items[index] = itemExist;
              }
            }
          });
          state.errorsAPIValidate = null;
          return;
        }

        // In case normal: get list special promotion
        state.promotion = specialPromotion;
        state.errorSpecialPromotions = null;
        const keyStore: SpecialPromotionSearchKey = 'selected_store';
        const appendPromotions = addPromotions(
          action.payload.data.data?.items?.length,
          action.payload.config.params[keyStore]
        );
        state.promotion.items.push(...appendPromotions);
        state.reloadToggle = !state.reloadToggle;
        state.promotionItemsDefault = state.promotion.items;
        state.errorSpecialPromotions = null;
      })
      .addCase(updateListSpecialPromotion.fulfilled, (state, action) => {
        if (state.modeSearch) {
          state.errorsAPIValidate = parseDataResponseErrorValidate(
            action.payload.data,
            state.promotion.items
          );
          return;
        }

        // Mode Add
        const errors = parseDataResponseErrorValidate(action.payload.data, state.promotion.items);
        if (isNullOrEmpty(errors)) {
          state.promotion.items = addPromotions();
        } else {
          state.errorSpecialPromotions = errors;
        }
      })
      .addCase(suggestProduct.fulfilled, (state, action) => {
        if (state.suggestedPromotion === null) return;
        if (action.payload.data.data === null) {
          const pluKey: TSuggestProductParam = 'plu';
          if (Object.keys(action.payload.config.params)?.includes(pluKey)) {
            state.promotion.items[state.indexSuggestProduct].my_company_code = '';
          } else {
            state.promotion.items[state.indexSuggestProduct].item_code = '';
          }

          state.promotion.items[state.indexSuggestProduct].item_name =
            localizeString('MSG_ERR_001');
          state.promotion.items[state.indexSuggestProduct].valid = null;
          state.promotion.items[state.indexSuggestProduct].isError = true;
          state.promotion.items[state.indexSuggestProduct].operation_type = null;
          return;
        }

        const data = action.payload.data.data;
        state.promotion.items[state.indexSuggestProduct] = {
          ...state.promotion.items[state.indexSuggestProduct],
          operation_type: OperationType.New,
          item_code: data?.item_code,
          my_company_code: data?.my_company_code,
          item_name: data?.description,
          unit_price: data?.unit_price,
          current_price: data?.current_price,
          status: state.applyAll.status,
          type_code: state.applyAll.type_code,
          start_date: state.applyAll.start_date,
          start_time: state.applyAll.start_time,
          end_date: state.applyAll.end_date,
          end_time: state.applyAll.end_time,
          isError: false,
          valid: data.special_valid + 5 // valid 0 => 5: 新規, 1 => 6: 変更
        };

        if (
          state.errorSpecialPromotions &&
          state.errorSpecialPromotions[state.indexSuggestProduct]
        ) {
          state.errorSpecialPromotions[state.indexSuggestProduct] = null;
        }

        state.indexSuggestProduct = null;
      })
      .addCase(suggestProduct.rejected, (state, action) => {
        const response = (action.error as AxiosError).response;

        if (response?.status === NOT_FOUND_CODE && state.suggestedPromotion) {
          const pluKey: TSuggestProductParam = 'plu';
          if (Object.keys(response.config.params)?.includes(pluKey)) {
            state.promotion.items[state.indexSuggestProduct].my_company_code = '';
          } else {
            state.promotion.items[state.indexSuggestProduct].item_code = '';
          }

          state.promotion.items[state.indexSuggestProduct].item_name = localizeString('MSG_ERR_001');
          state.promotion.items[state.indexSuggestProduct].valid = null;
          state.promotion.items[state.indexSuggestProduct].isError = true;
          state.promotion.items[state.indexSuggestProduct].operation_type = null;
        }
      })
      .addCase(getDetailPromotion.fulfilled, (state, action) => {
        if (isNullOrEmpty(state.searchState?.promotion_code)) return;

        if (action.payload.data.data === null) {
          state.suggestedPromotion = { hasData: false, name: localizeString('MSG_ERR_001') };
        } else {
          state.suggestedPromotion = { ...action.payload.data.data, hasData: true };
        }
      });
  }
});

export const {
  clearData,
  setErrorSpecialPromotions,
  updateSuggestedPromotion,
  applyAllStatus,
  applyAllTimeService,
  applyAllDiscountRate,
  clearDataAddProductOrPLU,
  setPromotionItems,
  setIndexSuggestProduct,
  setApplyInfo,
  setPromotionCode,
  setGroupCode,
  resetPrice,
  addPage,
  setSort,
  clearSpecialPromotion,
  clearSpecialPromotionAtIndex,
  setModeSearch,
  addSpecialPromotion,
  clearDataSearch,
  clearPrice
} = specialPromotionSlice.actions;

export default specialPromotionSlice.reducer;
