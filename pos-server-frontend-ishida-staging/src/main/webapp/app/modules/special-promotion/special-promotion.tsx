import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import './special-promotion.scss';
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
  clearSpecialPromotion,
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
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import { convertDateServer, isStartEndDateValid } from 'app/helpers/date-utils';
import { suggestProduct } from 'app/services/product-service';
import { ITimeProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { END_HOURS_DEFAULT, GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH, START_HOURS_DEFAULT, STATUS } from 'app/constants/constants';
import ModalPromotion from 'app/modules/special-promotion/modal-special-promotion/modal-promotion';
import { IStoreInfo } from 'app/reducers/store-reducer';
import { validateSpecialPromotions } from 'app/modules/special-promotion/validate/special-promotion-validate';
import { Translate } from 'react-jhipster';
import Dropdown from 'app/components/dropdown/dropdown';
import {
  focusElement,
  focusInputElementTable,
  getFocusableElements,
  handleFocusListElement,
} from 'app/helpers/utils-element-html';
import { setErrorValidate } from 'app/reducers/error';

import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { TSortType } from 'app/components/table/table-data/interface-table';
import _ from 'lodash';

let priorityElements: HTMLElement[] = [];
let listTimeInputElements: HTMLElement[] = [];

const SpecialPromotion = () => {
  const dispatch = useAppDispatch();
  const { topView } = useContext(KeyboardViewContext);
  const promotion: ISpecialPromotionResponse = useAppSelector((state) => state.specialPromotionReducer.promotion);
  const suggestedPromotion: IPromotionDetail = useAppSelector(
    (state) => state.specialPromotionReducer.suggestedPromotion
  );
  const searchState: ISpecialPromotionSearchState = useAppSelector(
    (state) => state.specialPromotionReducer.searchState
  );
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const modeSearch = useAppSelector((state) => state.specialPromotionReducer.modeSearch);
  const lengthItem = useAppSelector((state) => state.specialPromotionReducer.length);

  const pagingRef = useRef<ISearchSpecialPromotionHandle>();
  const specialPromotionRef = useRef(null);

  const [isStandardPrice, setIsStandardPrice] = React.useState(true);
  const [isPercentPrice, setIsPercentPrice] = React.useState(false);
  const [enabledPLU, setEnabledPLU] = React.useState(true);

  const disableConfirm = promotion.items.every((item) => !item?.operation_type);

  const selectedStore: IStoreInfo = useMemo(() => {
    return stores?.find((item) => item.store_code === selectedStores[0]);
  }, [selectedStores]);

  /**
   * useEffect: Add event key tab, enter
   */
  useEffect(() => {
    if (topView?.type !== 'main') return;

    const focusableElements = getFocusableElements(specialPromotionRef?.current, false);
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        handleFocusElement(focusableElements, e);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleFocusElement(focusableElements, e);
        return;
      }
    };

    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [promotion.items.length, topView?.type, lengthItem, enabledPLU]);

  /**
   * useEffect: In case search: get Element focus in mode search
   */
  useEffect(() => {
    findElements();
  }, [lengthItem]);

  /**
   * useEffect: In case suggest promotion: get Element focus in mode add
   */
  useEffect(() => {
    if (!suggestedPromotion || !suggestedPromotion.hasData) return;
    findElements();
  }, [suggestedPromotion]);

  /**
   * useEffect: Get list element input end_time in table
   */
  useEffect(() => {
    listTimeInputElements = [
      ...(specialPromotionRef.current?.querySelectorAll('.end_time .time-picker__time-picker-input') ?? null),
    ];

    return () => {
      dispatch(clearData(null));
    };
  }, []);

  useEffect(() => {
    dispatch(resetPrice(isPercentPrice));
  }, [isPercentPrice]);

  /**
   * handleFocusElement: Handle focus when tab or enter
   * @param focusableElements
   * @param e
   */
  const handleFocusElement = (focusableElements: any[], e: any) => {
    if (priorityElements.includes(document.activeElement as HTMLElement)) {
      focusPriorityListElement(priorityElements, e);
      return;
    }

    // If active element is time picker => focus to next group_code or item_code
    if (checkFocusFromTimeInput(e)) return;

    handleFocusListElement(focusableElements, e);
  };

  /**
   * checkFocusFromTimeInput: Check current focus is end_time, calculate next focus
   */
  const checkFocusFromTimeInput = (e: any) => {
    const indexTime = listTimeInputElements?.findIndex((element) => element === document.activeElement);
    if (indexTime >= lengthItem && !e?.shiftKey) {
      if (indexTime === listTimeInputElements?.length - 1) {
        const newIndex = lengthItem > 0 ? 0 : enabledPLU ? 2 : 0;
        priorityElements?.[newIndex]?.focus();
        return true;
      }

      const newIndex = lengthItem * 7 + (indexTime + 1 - lengthItem) * 4 + (enabledPLU ? 2 : 0);
      const element = priorityElements?.[newIndex];
      element?.focus();
      return true;
    }
    return false;
  };

  /**
   * findElements: Get element input table on mode search, add
   */
  const findElements = () => {
    // Get element focus for input for group code, product code, item code, discount value or special_price
    const elements = [
      ...(specialPromotionRef.current?.querySelectorAll(
        '.double-input-text1, .double-input-text2, .item_code .tooltip-number-input-text, .special_price .tooltip-number-input-text, .discount_value .tooltip-number-input-text'
      ) ?? []),
    ];

    // Mode search have data from API
    if (modeSearch && lengthItem > 0) {
      // Get elements status
      priorityElements = [
        ...(specialPromotionRef.current?.querySelectorAll('.status .tooltip-number-input-text') ?? []),
      ].slice(0, lengthItem);

      // Add more elements discount value or special_price
      priorityElements = priorityElements.concat(
        [
          ...(specialPromotionRef.current?.querySelectorAll(
            '.special_price .tooltip-number-input-text, .discount_value .tooltip-number-input-text'
          ) ?? []),
        ].slice(0, lengthItem)
      );

      // Add more elements type code, date, time
      priorityElements = priorityElements.concat(
        [
          ...(specialPromotionRef.current?.querySelectorAll(
            '.type_code .tooltip-number-input-text, .promotion-table__cell .input-text-mark'
          ) ?? []),
        ].slice(0, lengthItem * 5)
      );

      // Add more element don't have record from API
      if (lengthItem < 11) {
        priorityElements = priorityElements.concat(elements?.slice(lengthItem * 4));
      }
      return;
    }

    // Mode Add
    priorityElements = elements ?? [];
  };

  /**
   * Focus elements in table when tab, enter, shift-tab
   * @param focusableElements
   * @param e
   */
  const focusPriorityListElement = (focusableElements: any[], e: any) => {
    const elementsFocus = focusableElements?.filter((element) => !element?.disabled);
    if (isNullOrEmpty(elementsFocus)) return;

    const firstElement = elementsFocus[0];
    const lastElement = elementsFocus[elementsFocus.length - 1];
    e.preventDefault();
    const index = elementsFocus.findIndex((item) => item === document.activeElement);

    if (e.shiftKey) {
      if (index < 0 || document.activeElement === firstElement) {
        // Get last element need focus when current focus in first element
        const lastPriorityElement =
          lengthItem > 0 ? elementsFocus?.[lengthItem * 2 - 1] : elementsFocus[elementsFocus?.length - 1];
        focusElement(lastPriorityElement);
        return;
      }
      focusElement(elementsFocus[index - 1]);
      return;
    }

    // Check current focus element is last element, last special price element mode search or last time element mode search
    if (
      index < 0 ||
      document.activeElement === lastElement ||
      (lengthItem > 0 && (index === lengthItem * 2 - 1 || index === lengthItem * 7 - 1))
    ) {
      focusElement(firstElement);
      return;
    }

    // Focus next element
    focusElement(elementsFocus[index + 1]);
  };

  const resetData = () => {
    setEnabledPLU(true);
    setIsStandardPrice(true);
    setIsPercentPrice(false);
    dispatch(
      clearData({
        startTime: START_HOURS_DEFAULT,
        endTime: END_HOURS_DEFAULT,
      })
    );
  };

  const handleClearData = () => {
    dispatch(
      clearData({
        startTime: START_HOURS_DEFAULT,
        endTime: END_HOURS_DEFAULT,
      })
    );
  };

  const actionConfirm = (action?: 'next' | 'prev' | 'first' | 'last') => {
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
        record_id: item.record_id,
        store_code: item.store_code ?? selectedStores[0],
        promotion_code: searchState?.promotion_code,
        status: item.status,
        item_code: item.item_code,
        discount_method_code: isPercentPrice ? DiscountMethodCode.Percent : DiscountMethodCode.Amount,
        special_price: isPercentPrice ? item.discount_value : _.parseInt(item.special_price),
        type_code: item.type_code,
        start_date: item.start_date,
        end_date: item.end_date,
        start_time: item.start_time,
        end_time: item.end_time,
      }));

    dispatch(updateListSpecialPromotion({ items: dataUpdate }))
      .then((response) => {
        if (response.payload.data.status === STATUS.success && !action) {
          resetData();
          return;
        }

        if (modeSearch) {
          pagingRef.current?.getSpecialPromotions(action);
        }
      })
      .catch(() => {});
  };

  const handlePaging = (action?: 'next' | 'prev' | 'first' | 'last') => {
    actionConfirm(action);
  };

  const handleSort = (sort_column?: keyof ISpecialPromotion, sort_value?: TSortType) => {
    pagingRef.current?.getSpecialPromotions(null, sort_column, sort_value);
  };

  const selectTimeService = () => {
    dispatch(
      clearData({
        startTime: START_HOURS_DEFAULT,
        endTime: END_HOURS_DEFAULT,
      })
    );
  };

  const handleCollapseSidebar = () => {
    if (!suggestedPromotion) {
      const promotionElement = document.querySelector('.special-promotion__promotion-input-code');
      (promotionElement as HTMLInputElement)?.focus();
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
      />
      <SidebarStore
        onClickSearch={() => {}}
        hasData={promotion?.items.some(
          (item) => !isNullOrEmpty(item.item_code) && !isNullOrEmpty(item.my_company_code)
        )}
        firstSelectStore={selectTimeService}
        actionConfirm={handleClearData}
        expanded={true}
        onChangeCollapseExpand={handleCollapseSidebar}
      />
      <SearchSpecialPromotion
        ref={pagingRef}
        isStandardPrice={isStandardPrice}
        setIsStandardPrice={setIsStandardPrice}
        isPercentPrice={isPercentPrice}
        setIsPercentPrice={setIsPercentPrice}
        enabledPLU={enabledPLU}
      />
      <ApplyAllPromotions enabledPLU={enabledPLU} setEnabledPLU={setEnabledPLU} isPercentPrice={isPercentPrice} />
      <ViewTable
        enabledPLU={enabledPLU}
        isPercentPrice={isPercentPrice}
        isStandardPrice={isStandardPrice}
        disable={!suggestedPromotion?.hasData}
        store={selectedStore}
        onclickSort={handleSort}
      />
      <PagingBottomButton
        dataChange={promotion.items}
        disableConfirm={disableConfirm}
        confirmAction={() => actionConfirm()}
        totalPage={promotion?.total_page}
        limit={11}
        page={promotion?.current_page}
        actionPaging={handlePaging}
        disableClear={isNullOrEmpty(searchState?.promotion_code)}
        clearAction={resetData}
        total_record={promotion?.total_item}
        disableNextPage={promotion.items.some((item) => !item.operation_type && !item.record_id)}
      />
    </div>
  );
};

export default SpecialPromotion;

const SearchSpecialPromotion = forwardRef<ISearchSpecialPromotionHandle, ISearchPromotionView>(
  ({ isStandardPrice, setIsStandardPrice, isPercentPrice, setIsPercentPrice, enabledPLU }, ref) => {
    const dispatch = useAppDispatch();
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

    const promotionCodeRef = useRef<HTMLInputElement>(null);
    const disableShowModalRef = useRef(false);

    const disableAction = isNullOrEmpty(searchState?.promotion_code) || !suggestedPromotion?.hasData;
    const dirtyCheck = specialPromotion.items.some((item) => item.operation_type);

    // Action paging
    useImperativeHandle(ref, () => ({
      getSpecialPromotions,
    }));

    // Focus promotion code when display screen, clear data
    useEffect(() => {
      if (isNullOrEmpty(searchState?.promotion_code)) promotionCodeRef.current?.focus();
    }, [searchState?.promotion_code]);

    useEffect(() => {
      if (specialPromotion?.current_page > specialPromotion.total_page) {
        focusElementTable();
      }
    }, [specialPromotion.current_page]);

    useEffect(() => {
      if (suggestedPromotion?.hasData === true) {
        const itemCode: SpecialPromotionKey = 'item_code';
        const myCompanyCode: SpecialPromotionKey = 'my_company_code';
        focusInputElementTable(null, true, null, enabledPLU ? itemCode : myCompanyCode);
      }
    }, [suggestedPromotion?.hasData]);

    const suggestPromotion = (code: string) => {
      if (isNullOrEmpty(code) || isNullOrEmpty(selectedStores)) return;
      dispatch(
        getDetailPromotion({
          selected_store: selectedStores[0],
          promotion_code: code,
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
        md_hierarchy_code1: searchState?.md_hierarchy_code1?.padStart(2, '0'),
        sort_value: sortValue ?? searchState?.sort_value ?? 'ASC',
        sort_column: sortColumn ?? searchState?.sort_column ?? 'my_company_code',
      };
      if (isNullOrEmpty(query.md_hierarchy_code1)) {
        delete query.md_hierarchy_code1;
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
      }
    };

    const handleAddPage = () => {
      dispatch(addPage(selectedStores[0]));
    };

    const onClickSearch = () => {
      dispatch(setSort({ key: null, value: 'ASC' }));
      getSpecialPromotions(null, 'my_company_code', 'ASC', true);
    };

    /**
     * When clicking the show promotion button, check that the mouse cursor is focused on the input promotion code
     */
    const onMouseDownButtonPromotion = () => {
      if (isNullOrEmpty(promotionCodeRef.current?.value)) {
        disableShowModalRef.current = false;
        return;
      }

      disableShowModalRef.current = document.activeElement === promotionCodeRef.current;
    };

    /**
     * Action onClick button show modal promotion
     */
    const handleOpenModalSearch = () => {
      if (disableShowModalRef.current === true) {
        disableShowModalRef.current = false;
        return;
      }

      setShowModalPromotion(true);
    };

    return (
      <div className="special-promotion__search">
        <ModalPromotion
          showModal={showModalPromotion}
          selected_store={selectedStores ? selectedStores[0] : null}
          closeModal={handleCloseModalPromotion}
        />
        <div className="special-promotion__promotion">
          <span className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.promotionCode'} />
          </span>
          <div className="special-promotion__promotion-content">
            <TooltipNumberInputText
              value={searchState?.promotion_code}
              className={`special-promotion__promotion-input-code`}
              maxLength={5}
              onChange={(value) => dispatch(setPromotionCode(value))}
              focusOut={suggestPromotion}
              addZero={true}
              disabled={suggestedPromotion?.hasData || isNullOrEmpty(selectedStores)}
              inputRef={promotionCodeRef}
            />
            <ButtonPrimary
              className="special-promotion__promotion-search-button"
              text="action.search"
              onMouseDown={onMouseDownButtonPromotion}
              onClick={handleOpenModalSearch}
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
          <span className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.hierachyCode'} />
          </span>
          <TooltipNumberInputText
            placeholder="00"
            value={searchState?.md_hierarchy_code1}
            className="special-promotion__promotion-input-group-code"
            disabled={disableAction}
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
              group: searchState?.md_hierarchy_code1,
            }}
            disabled={disableAction}
            onClickAction={onClickSearch}
            dirtyCheck={dirtyCheck}
            okDirtyCheckAction={onClickSearch}
          />
          <FuncKeyDirtyCheckButton
            funcKey={null}
            text={
              isPercentPrice
                ? 'specialPromotion.specialSalePriceSetting'
                : 'specialPromotion.specialSaleDiscountSetting'
            }
            disabled={disableAction}
            onClickAction={() => {
              setIsPercentPrice(!isPercentPrice);
              dispatch(clearSpecialPromotion());
            }}
            dirtyCheck={dirtyCheck}
            okDirtyCheckAction={() => {
              setIsPercentPrice(!isPercentPrice);
              dispatch(clearSpecialPromotion());
            }}
          />
        </div>
        <div className="special-promotion__promotion-period">
          <span className="special-promotion__promotion-title">
            <Translate contentKey={'specialPromotion.period'} />
          </span>
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

const ApplyAllPromotions: React.FC<IApplyPromotionView> = ({ enabledPLU, setEnabledPLU, isPercentPrice }) => {
  const dispatch = useAppDispatch();
  // Reducer state
  const hasPromotion: boolean = useAppSelector((state) => state.specialPromotionReducer.suggestedPromotion?.hasData);
  const enabledApply: boolean = useAppSelector((state) => state.specialPromotionReducer.promotion?.items)?.some(
    (item: ISpecialPromotion) => item.record_id || item.operation_type
  );
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
              disabled={!enabledApply}
              items={promotionStatus}
              onChange={(item) => handleApply('status', item.value as string)}
              hasLocalized={true}
            />
            <ButtonPrimary
              disabled={!enabledApply}
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
            disabled={!hasPromotion}
          />
        </div>
        <div className="special-promotion__aplly-all-status">
          <div className="special-promotion__promotion-content">
            <TooltipNumberInputText
              value={applyAll?.discount_rate}
              disabled={!isPercentPrice || !enabledApply}
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
              disabled={!isPercentPrice || !enabledApply}
              onClick={applyAllDiscountRatePromotion}
            />
          </div>
        </div>
      </div>
      <div className="special-promotion__aplly-all-status">
        <ButtonPrimary
          text="specialPromotion.dateReflection"
          disabled={
            !isStartEndDateValid(
              applyAll?.start_date,
              applyAll?.end_date,
              applyAll?.start_time,
              applyAll?.end_time,
              true
            ) || !enabledApply
          }
          onClick={applyAllDateServicePromotion}
        />
        <Dropdown
          value={applyAll?.type_code}
          className="special-promotion__promotion-input-time-service"
          disabled={!enabledApply}
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
            disabled={!enabledApply}
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
  onclickSort,
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
  const searchQuery: ISpecialPromotionSearchState = useAppSelector((state) => state.specialPromotionReducer.searchState);
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
      dispatch(suggestProduct({ selected_store: store?.store_code, plu: value, promotion_code: searchQuery?.promotion_code }));
    } else if (value?.length === GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH) {
      dispatch(
        suggestProduct({
          selected_store: store?.store_code,
          product_code: value?.substring(2),
          group_code: value?.substring(0, 2),
          promotion_code: searchQuery?.promotion_code,
        })
      );
    } else {
      setTimeout(() => {
        if (document.activeElement.className?.includes('double-input')) return;
        dispatch(setPromotionItems({ key: 'my_company_code', value: null, index }));
        dispatch(clearSpecialPromotionAtIndex(index));
      }, 20);
    }
  };

  const actionSort = (keyItem: keyof ISpecialPromotion, type: TSortType) => {
    dispatch(setSort({ key: keyItem, value: type }));
    if (onclickSort) onclickSort(keyItem, type);
  };

  return (
    <>
      <SpecialPromotionTable<ISpecialPromotion>
        errorItems={errorSpecialPromotions}
        bodyItems={promotion?.items}
        reload={reload}
        errorClassName={'specialPromotion'}
        disableSelect={true}
        sort={{ type: searchQuery?.sort_value, key: searchQuery?.sort_column }}
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
            actionSort,
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
          },
          {
            title: 'specialPromotion.start_date',
            keyItem: 'start_date',
            type: 'date',
            disabled: disable,
            actionSort,
          },
          {
            title: 'specialPromotion.end_date',
            keyItem: 'end_date',
            type: 'date',
            disabled: disable,
          },
          {
            title: 'specialPromotion.start_time',
            keyItem: 'start_time',
            type: 'time',
            disabled: disable,
          },
          {
            title: 'specialPromotion.end_time',
            keyItem: 'end_time',
            type: 'time',
            disabled: disable,
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
