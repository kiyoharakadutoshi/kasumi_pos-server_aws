import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './../special-promotion/special-promotion.scss';
import SpecialPromotionTable from 'app/modules/special-promotion/special-promotion-table/special-promotion-table';
import {
  DiscountMethodCode,
  IApplyPromotionState,
  IApplyPromotionView,
  ISearchPromotionView,
  ISearchSpecialPromotionHandle,
  ISpecialPromotion,
  ISpecialPromotionSearch,
  ISpecialPromotionSearchState,
  promotionStatus,
  promotionValid,
  SpecialPromotionKey,
  timeServiceStatus,
} from 'app/modules/special-promotion/interface/special-sale-interface';
import Header from 'app/components/header/header';
import PagingBottomButton from 'app/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import DateTimeStartEnd, { DateTimeText } from 'app/modules/special-promotion/date-time-start-end/date-time';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  addPage,
  applyAllDiscountRate,
  applyAllStatus,
  applyAllTimeService,
  clearData,
  clearDataAddProductOrPLU,
  clearSpecialPromotionAtIndex,
  resetPrice,
  setApplyInfo,
  setErrorSpecialPromotions,
  setGroupCode,
  setIndexSuggestProduct,
  setPromotionCode,
  setPromotionItems,
  setSort,
  updateSuggestedPromotion,
  setModeSearch,
  addSpecialPromotion,
  clearDataSearch,
  clearPrice,
} from 'app/reducers/special-promotion-reducer';
import TooltipNumberInputText from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text';
import {
  getDetailPromotion,
  getListSpecialPromotion,
  IPromotionDetail,
  ISpecialPromotionResponse,
  updateListSpecialPromotion,
} from 'app/services/promotion-service';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import PopoverText from 'app/components/popover/popover';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { convertDateServer } from 'app/helpers/date-utils';
import { suggestProduct } from 'app/services/product-service';
import { ITimeProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH, STATUS } from 'app/constants/constants';
import ModalPromotion from 'app/modules/special-promotion/modal-special-promotion/modal-promotion';
import { IStoreInfo, selectSingleStore, setSelectedStore } from 'app/reducers/store-reducer';
import { validateSpecialPromotions } from 'app/modules/special-promotion/validate/special-promotion-validate';
import { Translate } from 'react-jhipster';
import Dropdown from 'app/components/dropdown/dropdown';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';
import { focusInputElementTable } from 'app/helpers/utils-element-html';
import { setErrorValidate } from 'app/reducers/error';
import { TSortType } from 'app/components/table/table-data/interface-table';
import { useLocation, useNavigate } from 'react-router';
import { setReloadDataProduct } from 'app/reducers/product-management-reducer';

const SpecialPromotionEdit = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const query = location?.state;
  const isEditMode = !isNullOrEmpty(query?.promotion_code);
  const isPercent = !isNullOrEmpty(query?.discount_value) && isNullOrEmpty(query?.special_price);
  const promotion: ISpecialPromotionResponse = useAppSelector((state) => state.specialPromotionReducer.promotion);
  const suggestedPromotion: IPromotionDetail = useAppSelector(
    (state) => state.specialPromotionReducer.suggestedPromotion
  );
  const searchState: ISpecialPromotionSearchState = useAppSelector(
    (state) => state.specialPromotionReducer.searchState
  );
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);

  const pagingRef = useRef<ISearchSpecialPromotionHandle>();
  const specialPromotionRef = useRef(null);

  const [isStandardPrice, setIsStandardPrice] = React.useState(true);
  const [isPercentPrice, setIsPercentPrice] = React.useState(isPercent);
  const [enabledPLU, setEnabledPLU] = React.useState(true);

  const disableConfirm = promotion.items.every((item) => !item?.operation_type);

  const selectedStore: IStoreInfo = useMemo(() => {
    return stores?.find((item) => item.store_code === selectedStores[0]);
  }, [selectedStores]);

  elementChangeKeyListener(promotion.items.length);

  useEffect(() => {
    dispatch(setReloadDataProduct(false));
    return () => {
      dispatch(clearData(null));
    };
  }, []);

  useEffect(() => {
    if (!query || isNullOrEmpty(query?.store_code)) return;

    dispatch(
      addSpecialPromotion({
        product: {
          record_id: Number(query?.record_id ?? -1),
          belong_to: query?.belong_to,
          company_code: query?.company_code,
          current_price: query?.current_price,
          description: query?.description,
          exist_in: query?.exist_in,
          my_company_code: query?.my_company_code,
          sku_code: query?.item_code,
          special_valid: Number(query?.valid),
          unit_price: query?.unit_price,
          item_code: query?.item_code,
        },
        discountValue: query?.discount_value,
        specialPrice: query?.special_price,
        startTime: selectedStore?.start_hours,
        endTime: selectedStore?.end_hours,
      })
    );
    const store = stores?.find((item) => item.store_code === query?.store_code);
    if (store) {
      dispatch(setSelectedStore([query?.store_code]));
      dispatch(selectSingleStore(query?.store_code));
      dispatch(setApplyInfo({ key: 'start_time', value: store?.start_hours }));
      dispatch(setApplyInfo({ key: 'end_time', value: store?.end_hours }));
    }

    if (!isEditMode) return;

    dispatch(setPromotionCode(query?.promotion_code));
    pagingRef.current?.suggestPromotion(query?.promotion_code, query?.store_code);
    getSpecialPromotion();
  }, []);

  const getSpecialPromotion = () => {
    if (!query || isNullOrEmpty(query?.promotion_code)) return;

    dispatch(
      getListSpecialPromotion({
        promotion_code: query?.promotion_code,
        item_code: query?.item_code,
        selected_store: query?.store_code,
        discount_method_code: isPercent ? DiscountMethodCode.Percent : DiscountMethodCode.Amount,
        limit: 1,
        page_number: 1,
        sort_value: 'ASC',
        sort_column: 'my_company_code',
      })
    )
      .unwrap()
      .then(() => {
        const status: SpecialPromotionKey = 'status';
        focusInputElementTable(promotion?.items, true, status, status);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isNullOrEmpty(query?.promotion_code)) return;
    dispatch(resetPrice(isPercentPrice));
  }, [isPercentPrice]);

  const actionConfirm = () => {
    // Validate data
    const { specialPromotionErrors, isError } = validateSpecialPromotions(
      promotion?.items,
      isPercentPrice,
      suggestedPromotion
    );
    dispatch(setErrorSpecialPromotions(specialPromotionErrors));
    if (isError) {
      return;
    }

    // Update data
    const dataUpdate = promotion?.items
      .filter((item) => item.operation_type && !isNullOrEmpty(item.item_code) && !isNullOrEmpty(item.my_company_code))
      .map((item) => ({
        record_id: item.record_id > 0 ? item.record_id : null,
        selected_store: item.store_code ?? selectedStores[0],
        promotion_code: searchState?.promotion_code,
        status: item.status,
        item_code: item.item_code,
        discount_method_code: isPercentPrice ? DiscountMethodCode.Percent : DiscountMethodCode.Amount,
        special_price: isPercentPrice ? item.discount_value : item.special_price,
        type_code: item.type_code,
        start_date: item.start_date,
        end_date: item.end_date,
        start_time: item.start_time,
        end_time: item.end_time,
      }));

    dispatch(updateListSpecialPromotion({ special_price: dataUpdate }))
      .then((response) => {
        if (response.payload.data.status === STATUS.success) {
          dispatch(setReloadDataProduct(true));
          navigate(-1);
        }
      })
      .catch(() => {});
  };

  const handlePaging = (action?: 'next' | 'prev' | 'first' | 'last') => {
    pagingRef.current?.getSpecialPromotions(action);
  };

  const handleSort = (sort_column?: keyof ISpecialPromotion, sort_value?: TSortType) => {
    pagingRef.current?.getSpecialPromotions(null, sort_column, sort_value);
  };

  const resetData = () => {
    setIsStandardPrice(true);
    dispatch(clearDataSearch(query));

    // Focus status table if mode edit
    if (isEditMode) {
      const status: SpecialPromotionKey = 'status';
      focusInputElementTable(promotion?.items, true, status, status);
    }
  };

  return (
    <div className="special-promotion" ref={specialPromotionRef}>
      <Header
        title={isPercentPrice ? 'specialPromotion.titleDiscount' : 'specialPromotion.titlePrice'}
        hasESC={true}
        csv={{ disabled: true }}
        printer={{ disabled: true }}
        hiddenTextESC={true}
        confirmBack={!disableConfirm}
        mode={query?.promotion_code ? 'edit' : 'add'}
      />
      <SearchSpecialPromotion
        ref={pagingRef}
        isStandardPrice={isStandardPrice}
        setIsStandardPrice={setIsStandardPrice}
        isPercentPrice={isPercentPrice}
        setIsPercentPrice={setIsPercentPrice}
        enabledPLU={enabledPLU}
        editPromotion={query?.promotion_code}
      />
      <ApplyAllPromotions enabledPLU={enabledPLU} setEnabledPLU={setEnabledPLU} isPercentPrice={isPercentPrice} />
      <ViewTable
        enabledPLU={enabledPLU}
        isPercentPrice={isPercentPrice}
        isStandardPrice={isStandardPrice}
        disable={isNullOrEmpty(query?.promotion_code) && !suggestedPromotion?.hasData}
        store={selectedStore}
        onclickSort={handleSort}
      />
      <PagingBottomButton
        dataChange={promotion.items}
        disableConfirm={disableConfirm}
        confirmAction={actionConfirm}
        totalPage={promotion?.total_page}
        limit={11}
        page={promotion?.current_page}
        actionPaging={handlePaging}
        disableClear={
          isNullOrEmpty(query?.promotion_code)
            ? isNullOrEmpty(searchState?.promotion_code)
            : !promotion?.items?.[0].operation_type
        }
        clearAction={resetData}
        total_record={promotion?.total_item}
        disableNextPage={promotion.items.some((item) => !item.operation_type && !item.record_id)}
      />
    </div>
  );
};

export default SpecialPromotionEdit;

const SearchSpecialPromotion = forwardRef<ISearchSpecialPromotionHandle, ISearchPromotionView>(
  ({ isStandardPrice, setIsStandardPrice, isPercentPrice, setIsPercentPrice, enabledPLU }, ref) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const stateLocation = location?.state;
    const isEditMode = !isNullOrEmpty(stateLocation?.promotion_code);

    const suggestedPromotion: IPromotionDetail = useAppSelector(
      (state) => state.specialPromotionReducer.suggestedPromotion
    );
    const specialPromotion: ISpecialPromotionResponse = useAppSelector(
      (state) => state.specialPromotionReducer.promotion
    );
    const searchState: ISpecialPromotionSearchState = useAppSelector(
      (state) => state.specialPromotionReducer.searchState
    );
    const dataApiError = useAppSelector((state) => state.specialPromotionReducer.errorsAPIValidate);
    const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);

    const [showModalPromotion, setShowModalPromotion] = useState(false);

    const disableAction = isNullOrEmpty(searchState?.promotion_code) || !suggestedPromotion?.hasData;
    const dirtyCheck = specialPromotion.items.some((item) => item.operation_type);

    // Action paging
    useImperativeHandle(ref, () => ({
      getSpecialPromotions,
      suggestPromotion,
    }));

    // Focus promotion code when display screen, clear data if mode add
    useEffect(() => {
      if (isEditMode) return;

      if (isNullOrEmpty(searchState?.promotion_code)) {
        setTimeout(() => {
          const promotionCode: HTMLInputElement = document.querySelector('.special-promotion__promotion-input-code');
          promotionCode?.focus();
        }, 50);
      }
    }, [searchState?.promotion_code]);

    useEffect(() => {
      if (specialPromotion?.current_page > specialPromotion.total_page) {
        focusElementTable();
      }
    }, [specialPromotion.current_page]);

    const suggestPromotion = (code: string, storeCode?: string, canSuggestProduct?: boolean) => {
      const selectedStore = storeCode ?? selectedStores?.[0];
      if (isNullOrEmpty(code) || isNullOrEmpty(selectedStore)) return;
      dispatch(
        getDetailPromotion({
          selected_store: selectedStore,
          promotion_code: code,
        })
      )
        .unwrap()
        .then((response) => {
          if (isEditMode) return;
          // Suggest product in mode Add
          if (canSuggestProduct && response.data?.data) {
            handleSuggest(code, selectedStore);
          }
        })
        .catch(() => {});
    };

    const handleSuggest = (code: string, storeCode?: string) => {
      dispatch(setIndexSuggestProduct(0));
      dispatch(
        suggestProduct({
          promotion_code: code,
          selected_store: storeCode,
          plu: specialPromotion?.items?.[0]?.item_code,
        })
      );
    };

    const getSpecialPromotions = (
      pagingAction?: 'next' | 'prev' | 'first' | 'last',
      sortColumn?: keyof ISpecialPromotion,
      sortValue?: TSortType,
      resetPage?: boolean
    ) => {
      // CLick F12 => mode search
      dispatch(setModeSearch(true));

      let pageNumber = specialPromotion?.current_page ?? 1;
      const totalPage = specialPromotion?.total_page ?? 1;

      switch (pagingAction) {
        case 'first':
          pageNumber = 1;
          break;
        case 'last':
          pageNumber = totalPage;
          break;
        case 'next':
          pageNumber = pageNumber + 1;
          if (pageNumber > totalPage) {
            handleAddPage();
            return;
          }
          break;
        case 'prev':
          pageNumber = Math.max(pageNumber - 1, 1);
          break;
        default:
          if (resetPage) pageNumber = 1;
          break;
      }

      const query: ISpecialPromotionSearch = {
        selected_store: selectedStores[0],
        promotion_code: searchState?.promotion_code,
        discount_method_code: isPercentPrice ? DiscountMethodCode.Percent : DiscountMethodCode.Amount,
        limit: 11,
        page_number: pageNumber,
        md_hierarchy_code_level_one: searchState?.md_hierarchy_code_level_one?.padStart(2, '0'),
        sort_value: sortValue ?? searchState?.sort_value ?? 'ASC',
        sort_column: sortColumn ?? searchState?.sort_column ?? 'my_company_code',
      };
      if (isNullOrEmpty(query?.md_hierarchy_code_level_one)) {
        delete query?.md_hierarchy_code_level_one;
      }
      dispatch(getListSpecialPromotion(query))
        .unwrap()
        .then((response) => {
          // If validate from api error => don't focus
          if (dataApiError) return;
          focusElementTable(response.data?.data?.items, pagingAction !== 'last');
        })
        .catch(() => {});
    };

    const focusElementTable = (items?: ISpecialPromotion[], focusFirst?: boolean) => {
      const status: SpecialPromotionKey = 'status';
      const itemCode: SpecialPromotionKey = 'item_code';
      const myCompanyCode: SpecialPromotionKey = 'my_company_code';
      focusInputElementTable(items, focusFirst, status, enabledPLU ? itemCode : myCompanyCode);
    };

    const handleCloseModalPromotion = (item?: IPromotionDetail) => {
      setShowModalPromotion(false);
      if (item) {
        dispatch(updateSuggestedPromotion(item));
        handleSuggest(item.code, selectedStores?.[0]);
      }
    };

    const handleAddPage = () => {
      dispatch(addPage(selectedStores?.[0]));
    };

    const onClickSearch = () => {
      dispatch(setSort({ key: null, value: 'ASC' }));
      getSpecialPromotions(null, 'my_company_code', 'ASC', true);
    };

    return (
      <div className="special-promotion__search">
        <ModalPromotion
          showModal={showModalPromotion}
          store_code={selectedStores ? selectedStores[0] : null}
          closeModal={handleCloseModalPromotion}
        />
        <div className="special-promotion__promotion">
          <label className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.promotionCode'} />
          </label>
          <div className="special-promotion__promotion-content">
            <TooltipNumberInputText
              value={searchState?.promotion_code}
              className={`special-promotion__promotion-input-code`}
              maxLength={5}
              onChange={(value) => dispatch(setPromotionCode(value))}
              focusOut={(value) => suggestPromotion(value, null, true)}
              addZero={true}
              disabled={suggestedPromotion?.hasData || isNullOrEmpty(selectedStores)}
            />
            <ButtonPrimary
              className="special-promotion__promotion-search-button"
              text="action.search"
              onClick={() => setShowModalPromotion(true)}
              disabled={suggestedPromotion?.hasData || isNullOrEmpty(selectedStores)}
            />
            <PopoverText
              text={suggestedPromotion?.name ?? ''}
              classNameText={`special-promotion__promotion-name ${
                suggestedPromotion?.hasData ? '' : 'special-promotion__promotion-name-error'
              }`.trim()}
              lineLimit={1}
              lineHeight={null}
            />
          </div>
        </div>
        <div className="special-promotion__promotion">
          <label className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.hierachyCode'} />
          </label>
          <TooltipNumberInputText
            placeholder="00"
            value={searchState?.md_hierarchy_code_level_one}
            className="special-promotion__promotion-input-group-code"
            disabled={true}
            maxLength={2}
            addZero={true}
            onChange={(value: string) => dispatch(setGroupCode(value))}
          />
        </div>
        <div className="special-promotion__promotion-right-button">
          <ButtonPrimary
            text={isStandardPrice ? 'specialPromotion.currentPriceChange' : 'specialPromotion.standardPriceChange'}
            onClick={() => setIsStandardPrice(!isStandardPrice)}
          />
          <FuncKeyDirtyCheckButton
            text="action.f12Search"
            funcKey={'F12'}
            funcKeyListener={{
              disableAction,
              code: searchState?.promotion_code,
              isPercentPrice,
              selectedStores,
              group: searchState?.md_hierarchy_code_level_one,
            }}
            disabled={true}
            onClickAction={onClickSearch}
            dirtyCheck={dirtyCheck}
            okDirtyCheckAction={onClickSearch}
          />
          <FuncKeyDirtyCheckButton
            text={
              isPercentPrice
                ? 'specialPromotion.specialSalePriceSetting'
                : 'specialPromotion.specialSaleDiscountSetting'
            }
            onClickAction={() => {
              setIsPercentPrice(!isPercentPrice);
              dispatch(clearPrice());
            }}
            okDirtyCheckAction={() => {
              setIsPercentPrice(!isPercentPrice);
              dispatch(clearPrice());
            }}
            disabled={!isNullOrEmpty(stateLocation?.promotion_code)}
          />
        </div>
        <div className="special-promotion__promotion-period">
          <label className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.period'} />
          </label>
          <div className="special-promotion__promotion-content">
            <DateTimeText
              startDate={suggestedPromotion?.start_date}
              endDate={suggestedPromotion?.end_date}
              startTime={suggestedPromotion?.start_time}
              endTime={suggestedPromotion?.end_time}
            />
          </div>
        </div>
      </div>
    );
  }
);

const ApplyAllPromotions: React.FC<IApplyPromotionView> = ({ enabledPLU, setEnabledPLU }) => {
  const dispatch = useAppDispatch();
  const applyAll: IApplyPromotionState = useAppSelector((state) => state.specialPromotionReducer.applyAll);

  const applyAllStatusPromotion = () => {
    dispatch(applyAllStatus(applyAll?.status));
  };

  const applyAllDiscountRatePromotion = () => {
    if (isNullOrEmpty(applyAll?.discount_rate)) {
      dispatch(
        setErrorValidate({
          param: 'promotion-input-discount',
          message: localizeString('MSG_VAL_052'),
        })
      );
      return;
    }
    dispatch(applyAllDiscountRate(applyAll?.discount_rate));
  };

  const applyAllDateServicePromotion = () => {
    dispatch(applyAllTimeService(applyAll));
  };

  const handleApply = (key: keyof IApplyPromotionState, value: ITimeProps | string) => {
    dispatch(setApplyInfo({ key, value }));
  };

  return (
    <div className="special-promotion__aplly-all">
      <div className="special-promotion__aplly-all-left">
        <div className="special-promotion__aplly-all-status">
          <div className="special-promotion__promotion-content">
            <Dropdown
              value={applyAll.status}
              className={`special-promotion__promotion-input-search special-promotion__promotion-input-status`}
              disabled={true}
              items={promotionStatus}
              onChange={(item) => handleApply('status', item.value as string)}
              hasLocalized={true}
            />
            <ButtonPrimary
              disabled={true}
              className="special-promotion__promotion-search-button"
              text="specialPromotion.statusReflection"
              onClick={applyAllStatusPromotion}
            />
          </div>
        </div>
        <div className="special-promotion__aplly-all-status">
          <ButtonPrimary
            text={enabledPLU ? 'specialPromotion.productCodeSwitching' : 'specialPromotion.PLUCodeSwitching'}
            onClick={() => {
              setEnabledPLU(!enabledPLU);
              dispatch(clearDataAddProductOrPLU());
            }}
            className="special-promotion__plu-group-code"
            disabled={true}
          />
        </div>
        <div className="special-promotion__aplly-all-status">
          <div className="special-promotion__promotion-content">
            <TooltipNumberInputText
              value={applyAll?.discount_rate}
              disabled={true}
              maxLength={2}
              className={`special-promotion__promotion-input-discount`}
              datatype={'promotion-input-discount'}
              minValue={1}
              maxValue={99}
              onChange={(value: string) => handleApply('discount_rate', value)}
            />
            <ButtonPrimary
              className="special-promotion__promotion-search-button"
              text="specialPromotion.discountRateReflected"
              disabled={true}
              onClick={applyAllDiscountRatePromotion}
            />
          </div>
        </div>
      </div>
      <div className="special-promotion__aplly-all-status">
        <ButtonPrimary text="specialPromotion.dateReflection" disabled={true} onClick={applyAllDateServicePromotion} />
        <Dropdown
          value={applyAll?.type_code}
          className="special-promotion__promotion-input-time-service"
          disabled={true}
          items={timeServiceStatus}
          onChange={(item) => handleApply('type_code', item.value as string)}
          hasLocalized={true}
        />
        <div className="special-promotion__promotion-content">
          <DateTimeStartEnd
            hasInitDate={true}
            startDate={applyAll?.start_date}
            startTime={applyAll?.start_time}
            endDate={applyAll?.end_date}
            endTime={applyAll?.end_time}
            onChangeStartDate={(date?: Date) => handleApply('start_date', convertDateServer(date))}
            onChangeStartTime={(_time?: ITimeProps, timeStr?: string) => handleApply('start_time', timeStr)}
            onChangeEndDate={(date?: Date) => handleApply('end_date', convertDateServer(date))}
            onChangeEndTime={(_time?: ITimeProps, timeStr?: string) => handleApply('end_time', timeStr)}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

const ViewTable = ({
  enabledPLU,
  isPercentPrice,
  isStandardPrice,
  disable,
  store,
}: {
  enabledPLU: boolean;
  isPercentPrice: boolean;
  isStandardPrice: boolean;
  disable?: boolean;
  store?: IStoreInfo;
  onclickSort?: (key: keyof ISpecialPromotion, type: TSortType) => void;
}) => {
  const dispatch = useAppDispatch();
  const promotion = useAppSelector((state) => state.specialPromotionReducer.promotion);
  const reload = useAppSelector((state) => state.specialPromotionReducer.reloadToggle);
  const errorSpecialPromotions = useAppSelector((state) => state.specialPromotionReducer.errorSpecialPromotions);

  const focusOut = (value: string, index: number) => {
    if (isNullOrEmpty(value)) {
      dispatch(clearSpecialPromotionAtIndex(index));
      return;
    }

    // Suggest API
    dispatch(setIndexSuggestProduct(index));
    if (value?.length > GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH) {
      dispatch(suggestProduct({ selected_store: store?.store_code, plu: value }));
    } else if (value?.length === GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH) {
      dispatch(
        suggestProduct({
          selected_store: store?.store_code,
          product_code: value?.substring(2),
          group_code: value?.substring(0, 2),
        })
      );
    }
  };

  return (
    <>
      <SpecialPromotionTable<ISpecialPromotion>
        errorItems={errorSpecialPromotions}
        bodyItems={promotion?.items}
        reload={reload}
        errorClassName={'specialPromotion'}
        disableSelect={true}
        columns={[
          {
            title: 'specialPromotion.valid',
            keyItem: 'valid',
            mappingValue: promotionValid,
            alignItem: 'center',
          },
          {
            title: 'specialPromotion.status',
            keyItem: 'status',
            type: 'input',
            disabled: disable,
            inputTextProps: {
              minValue: 0,
              maxValue: 1,
              maxLength: 1,
              textAlign: 'center',
            },
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.my_company_code',
            keyItem: 'my_company_code',
            type: 'doubleInput',
            disabled: enabledPLU || disable,
            inputTextProps: {
              disabledIfHasRecordId: true,
              addZero: true,
              textAlign: 'right',
              focusOut,
            },
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.item_code',
            keyItem: 'item_code',
            type: 'input',
            inputTextProps: {
              maxLength: 13,
              textAlign: 'right',
              disabledIfHasRecordId: true,
              addZero: true,
              focusOut,
            },
            disabled: !enabledPLU || disable,
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.item_name',
            keyItem: 'item_name',
            alignItem: 'left',
            checkError: true,
          },
          {
            title: isPercentPrice ? 'specialPromotion.discount_value' : 'specialPromotion.special_price',
            keyItem: isPercentPrice ? 'discount_value' : 'special_price',
            type: 'input',
            disabled: disable,
            inputTextProps: {
              minValue: 1,
              maxLength: isPercentPrice ? 2 : 6,
              textAlign: 'right',
              maxValue: isPercentPrice ? 99 : null,
              thousandSeparator: isPercentPrice ? null : ',',
            },
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          isStandardPrice
            ? {
                title: 'specialPromotion.unit_price',
                keyItem: 'unit_price',
                alignItem: 'right',
                formatNumber: true,
              }
            : {
                title: 'specialPromotion.current_price',
                keyItem: 'current_price',
                alignItem: 'right',
                formatNumber: true,
              },
          {
            title: 'T',
            keyItem: 'type_code',
            type: 'input',
            disabled: disable,
            inputTextProps: {
              minValue: 0,
              maxValue: 1,
              maxLength: 1,
              textAlign: 'center',
            },
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.start_date',
            keyItem: 'start_date',
            type: 'date',
            disabled: disable,
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.end_date',
            keyItem: 'end_date',
            type: 'date',
            disabled: disable,
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.start_time',
            keyItem: 'start_time',
            type: 'time',
            disabled: disable,
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
          {
            title: 'specialPromotion.end_time',
            keyItem: 'end_time',
            type: 'time',
            disabled: disable,
            cell(_key: any, index: number) {
              return { disabled: index !== 0 };
            },
          },
        ]}
        bodyItemChange={(key: keyof ISpecialPromotion, value: any, index: number) =>
          dispatch(
            setPromotionItems({
              key,
              index,
              value,
            })
          )
        }
      />
    </>
  );
};
