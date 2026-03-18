import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, Resolver, useForm, useWatch } from 'react-hook-form';
import { array, object, string, ValidationError } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Components
import Header from '@/components/header/header';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { PopoverLabelText } from '@/components/popover/popover';
import InputButtonGroup from '@/components/input/input-button';

import SpecialPromotionTable from '../special-promotion/special-promotion-table/special-promotion-table';
import {
  ISpecialPromotion,
  promotionStatus,
  promotionValid,
  TStatus,
} from '../special-promotion/interface/special-sale-interface';
import PagingBottomButton from '@/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import { getDetailPromotion, IPromotionDetail } from '@/services/promotion-service';
import Dropdown from '@/components/dropdown/dropdown';
import { dropdownList } from '../touch-menu/menu-preset/data-input';
import TooltipDatePicker from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import InputControl from './form-control/InputControl';
import { addItem } from '@/mock-data/mix-match-setting';
import DateTimeStartEnd from '../special-promotion/date-time-start-end/date-time';
import { MIX_MATCH_TYPE_LABEL, TIME_SERVICE, TIME_SERVICE_LABEL } from '@/constants/constants';
import { useLocation, useNavigate } from 'react-router';
import SelectControl from '@/components/control-form/select-control';

import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { convertDateServer } from '@/helpers/date-utils';

// Redux
import { useAppDispatch } from '@/config/store';
import { selectStore as selectStoreRedux } from '@/reducers/store-reducer';

// API
import {
  deleteMixMatch,
  getGeneratingMixMatchCode,
  getMixMatchDetail,
  IMixMatchOptionSettings,
  MixMatchDetailOption,
  postUpdateMixMatch,
} from 'app/services/mix-match-service';
import { suggestProduct } from '@/services/product-service';

// Utils
import { URL_MAPPING } from '@/router/url-mapping';
import {
  calculationHeightTable,
  convertQueryStringToObject,
  focusElementByName,
  isNullOrEmpty,
  localizeFormat,
} from '@/helpers/utils';
import { TBodyBase } from '@/components/table/table-common';

// Styles
import './styles.scss';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { STATUS } from 'app/constants/constants';
import { setReloadDataProduct } from 'app/reducers/product-management-reducer';
import {
  isEqual,
  isValidDate,
  isValidTime,
  localizeString,
  isEqualData,
  getGroupCode,
  getProductCode,
} from 'app/helpers/utils';
import { MIX_MATCH_SETTING_STATUS } from 'app/modules/product-management/product-management';

const TIME_SERVICE_LIST = [
  {
    code: '0',
    value: TIME_SERVICE.USUALLY,
    name: TIME_SERVICE_LABEL.USUALLY,
  },
  {
    code: '1',
    value: TIME_SERVICE.TIME_SERVICE,
    name: TIME_SERVICE_LABEL.TIME_SERVICE_LABEL,
  },
];

const MIX_MATCH_TYPE_LIST = [
  {
    code: '1',
    value: '01',
    name: MIX_MATCH_TYPE_LABEL.SALES_PRICE,
  },
  {
    code: '2',
    value: '02',
    name: MIX_MATCH_TYPE_LABEL.DISCOUNT,
  },

  {
    code: '3',
    value: '03',
    name: MIX_MATCH_TYPE_LABEL.DISCOUNT_MORE,
  },
];

export const VALID_EDIT_STATUS = {
  0: '新規',
  1: '変更',
};

const MAPPING_ERROR = (index: number) => ({
  [`options[${index}].unitsCompleted`]: '成立個数',
  [`options[${index}].priceCompleted`]: '成立金額',
  [`listProduct[${index}].status`]: '状態',
});

interface OptionsObjectForm {
  unitsCompleted: number;
  priceCompleted: number | null;
}

interface ProductPricingInfo extends TBodyBase {
  valid: number;
  status: string;
  my_company_code: string;
  item_code: string;
  item_name: string;
  unit_price: number;
  current_price: number;
}

interface FormData {
  periodTimeMixMatch: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  promotionCode: string;
  mixMatchName: string;
  mixMatchCode: string;
  mixMatchType: string;
  mixMatchTypeConst: string;
  mixMatchStatus: number;
  settingMixMatch: IMixMatchOptionSettings;
  listProduct: ISpecialPromotion[];
  options: OptionsObjectForm[];
  timeServiceMixMatch: number;
  startDateError?: string;
  endDateError?: string;
  startTimeError?: string;
  endTimeError?: string;
}

type TMixMatchsType = keyof FormData;

const compareKey: TMixMatchsType[] = [
  'periodTimeMixMatch',
  'promotionCode',
  'mixMatchCode',
  'mixMatchType',
  'mixMatchStatus',
  'listProduct',
  'options',
  'timeServiceMixMatch',
];

/**
 * SC0501
 *
 * @returns {JSX.Element} The MixMatchSettings page
 */
const MixMatchSettings = (): JSX.Element => {
  const location = useLocation();
  const query = convertQueryStringToObject(location.search);
  const dispatch = useAppDispatch();
  const divCommonRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();

  const defaultValues: FormData = {
    periodTimeMixMatch: {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    },
    // promotionCode: searchParams.get("promotion_code"),
    promotionCode: state?.promotion_code,
    mixMatchName: '',
    mixMatchCode: '',
    mixMatchType: '01',
    mixMatchTypeConst: '01',
    settingMixMatch: {} as IMixMatchOptionSettings,
    listProduct: [] as ISpecialPromotion[],
    timeServiceMixMatch: 0,
    options: [],
    mixMatchStatus: 0,
  };

  /**
   * State
   */
  const [isShowModal, setIsShowModal] = useState(false);
  const [isValidPromotionCode, setIsValidPromotionCode] = useState(false);
  const [defaultData, setDefaultData] = useState<FormData>(defaultValues);
  const [isFirstRender, setIsFirstRender] = useState(false);

  /**
   *
   */
  const screenType = useMemo(() => {
    return state !== null;
  }, [state]);

  /**
   * When back, reload, close tab from SC0501, mode Add from Sc0101 => call API 0503 to delete mixMatchs code genned
   */
  useEffect(() => {
    const deleteMixMatchs = () => {
      if (state?.mode === MIX_MATCH_SETTING_STATUS.ADD) {
        const mix_match_code = getValues('mixMatchCode');
        if (isNullOrEmpty(mix_match_code)) return;
        dispatch(deleteMixMatch({ selected_store: state?.store_code, mix_match_code }));
      }
    };

    window.addEventListener('beforeunload', deleteMixMatchs);
    return () => {
      deleteMixMatchs();
      window.removeEventListener('beforeunload', deleteMixMatchs);
    };
  }, []);

  /**
   * Define column table
   */
  const columns = useMemo<TableColumnDef<ProductPricingInfo>[]>(() => {
    return [
      {
        header: '有効',
        accessorKey: 'valid',
        size: 10,
        cell({ row }) {
          const value = row.original.valid;
          return isAddModeFromOtherScreen ? VALID_EDIT_STATUS[value] : promotionValid[value];
        },
        textAlign: 'center',
      },
      {
        header: '状態',
        accessorKey: 'status',
        size: 5,
        type: 'inputNumber',
        inputTextProps: { minValue: 0, maxValue: 1, maxLength: 1, textAlign: 'center' },
      },
      {
        header: '商品コード',
        size: 11,
        accessorKey: 'my_company_code',
        type: 'product',
        disabled: screenType,
        inputTextProps: { disabledIfHasRecordId: screenType, textAlign: 'right' },
      },
      {
        header: 'PLUコード',
        size: 15,
        accessorKey: 'item_code',
        type: 'inputNumber',
        disabled: screenType,
        inputTextProps: {
          maxLength: 13,
          textAlign: 'right',
          disabledIfHasRecordId: screenType,
        },
      },
      {
        header: '商品名称',
        type: 'text',
        size: 49,
        accessorKey: 'item_name',
        textAlign: 'left',
      },
      {
        header: '定番売価',
        size: 15,
        type: 'text',
        accessorKey: 'unit_price',
        textAlign: 'right',
        formatNumber: true,
      },
      {
        header: '現在売価',
        size: 15,
        type: 'text',
        accessorKey: 'current_price',
        textAlign: 'right',
        formatNumber: true,
      },
    ];
  }, [screenType]);

  const isAddModeFromOtherScreen = state?.mode === 'add' || false;

  const setErrorOption = (key: string, index: number, localizeKey: string, ...values: string[]) => {
    setError(`options[${index}].${key}` as keyof FormData, {
      message: localizeFormat(localizeKey, ...values),
    });
  };

  const checkValidateOption01 = (options: { unitsCompleted: number; priceCompleted: number }[]): boolean => {
    for (let i = 1; i < options.length; i++) {
      const item = options[i];
      const prevItem = options[i - 1];
      const averagePrice = Number(item.priceCompleted) / Number(item.unitsCompleted);
      const prevAveragePrice = Number(prevItem.priceCompleted) / Number(prevItem.unitsCompleted);

      if (averagePrice > prevAveragePrice) {
        setErrorOption('priceCompleted', i, 'MSG_VAL_053', 'mixMatchs.priceCompleted');
        return false;
      }
    }
    return true;
  };

  const checkValidateOption02 = (options: { unitsCompleted: number; priceCompleted: number }[]): boolean => {
    let isError = false;
    for (let i = 0; i < options.length; i++) {
      const price = Number(options[i].priceCompleted);
      for (let j = i + 1; j < options.length; j++) {
        const nextPrice = Number(options[j].priceCompleted);
        if (price > nextPrice) {
          setErrorOption('unitsCompleted', j, 'MSG_VAL_053', 'mixMatchs.unitsCompleted');
          isError = true;
        }
      }
    }
    return !isError;
  };

  const checkValidateOption03 = (options: { unitsCompleted: number; priceCompleted: number }[]): boolean => {
    for (let i = 1; i < options.length; i++) {
      const item = options[i];
      const prevItem = options[i - 1];
      const averagePrice = Number(item.priceCompleted) / Number(item.unitsCompleted);
      const prevAveragePrice = Number(prevItem.priceCompleted) / Number(prevItem.unitsCompleted);

      if (averagePrice < prevAveragePrice) {
        setErrorOption('priceCompleted', i, 'MSG_VAL_053', 'mixMatchs.priceCompleted');
        return false;
      }
    }
    return true;
  };

  const checkQuantity = (options: { unitsCompleted: number; priceCompleted: number }[]): boolean => {
    let isError = false;
    for (let i = 0; i < options.length; i++) {
      const quantity = Number(options[i].unitsCompleted);
      for (let j = i + 1; j < options.length; j++) {
        const nextQuantity = Number(options[j].unitsCompleted);
        if (quantity >= nextQuantity) {
          setErrorOption('unitsCompleted', j, 'MSG_VAL_053', 'mixMatchs.unitsCompleted');
          isError = true;
        }
      }
    }
    return !isError;
  };

  const validationSchema = object<FormData>().shape({
    options: array().test(
      (
        arrayOptions: Array<{
          unitsCompleted: number;
          priceCompleted: number | null;
        }>
      ) => {
        if (isNullOrEmpty(arrayOptions)) return false;
        let isEmptyValue: boolean = false;

        // Filter item validate option mix matchs
        const filterOptions = arrayOptions
          .map((item, index) => ({
            ...item,
            index,
          }))
          .filter((item, index) => {
            const unitsEmpty = isNullOrEmpty(item.unitsCompleted);
            const priceEmpty = isNullOrEmpty(item.priceCompleted);
            /*
            Check empty value:
            + option 0: all fields not empty
            + other option: If enter then enter all fields
             */
            if (unitsEmpty && priceEmpty && index > 0) return false;
            if (unitsEmpty) {
              isEmptyValue = true;
              setErrorOption('unitsCompleted', index, 'MSG_VAL_001', 'mixMatchs.unitsCompleted');
            } else if (Number(item.unitsCompleted) < 2) {
              isEmptyValue = true;
              setErrorOption('unitsCompleted', index, 'MSG_VAL_021', 'mixMatchs.unitsCompleted', '1');
            }

            if (priceEmpty) {
              isEmptyValue = true;
              setErrorOption('priceCompleted', index, 'MSG_VAL_001', 'mixMatchs.priceCompleted');
            }
            return true;
          });

        // If error base => stop validate
        if (isEmptyValue || isNullOrEmpty(filterOptions)) return false;

        if (!checkQuantity(filterOptions)) return false;

        // Validate price
        switch (mixMatchTypeWatch) {
          case '01':
            return checkValidateOption01(filterOptions);
          case '02':
            return checkValidateOption02(filterOptions);
          case '03':
            return checkValidateOption03(filterOptions);
          default:
            return false;
        }
      }
    ),
  });

  const validationSchema2 = object<FormData>().shape({
    listProduct: array().of(
      object().shape({
        status: string().required('MSG_VAL_001'),
      })
    ),
    endDate: string().test((value) => {
      if (!isValidDate(value)) {
        setValue('endDateError', null);
        return false;
      }

      const currentDate = convertDateServer(new Date());
      if (value < currentDate) {
        setValue('endDateError', localizeFormat('MSG_VAL_022', 'specialPromotion.end_date'));
        return false;
      }

      setValue('endDateError', null);
      return true;
    }),
    startDate: string().test((value) => {
      const endDate = getValues('periodTimeMixMatch.endDate');
      if (!isValidDate(endDate) || !isValidDate(value)) {
        setValue('startDateError', null);
        return false;
      }

      if (value > endDate) {
        setValue('startDateError', localizeString('MSG_VAL_051'));
        return false;
      }

      setValue('startDateError', null);
      return true;
    }),
    startTime: string().test((value) => {
      const startDate = getValues('periodTimeMixMatch.startDate');
      const endDate = getValues('periodTimeMixMatch.endDate');
      const endTime = getValues('periodTimeMixMatch.endTime');
      if (!isValidDate(endDate) || !isValidDate(startDate) || !isValidTime(value) || !isValidTime(endTime)) {
        setValue('startTimeError', null);
        return false;
      }

      if (value < endTime) {
        setValue('startTimeError', null);
        return true;
      }

      if ((startDate < endDate && isEqual(getValues('timeServiceMixMatch'), 1)) || startDate === endDate) {
        setValue('startTimeError', localizeString('MSG_VAL_051'));
        return false;
      }

      setValue('startTimeError', null);
      return true;
    }),
    endTime: string().test((value) => {
      const endDate = getValues('periodTimeMixMatch.endDate');
      const date = new Date();
      const currentDate = convertDateServer(date);
      const currentTime = `${date.getHours()}:${date.getMinutes()}`;
      if (!isValidDate(endDate) || !isValidTime(value)) {
        setValue('endTimeError', null);
        return false;
      }

      if (endDate === currentDate && value <= currentTime) {
        setValue('endTimeError', localizeString('MSG_VAL_022'));
        return false;
      }

      setValue('endTimeError', null);
      return true;
    }),
  });

  const formConfig = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });

  const { getValues, watch, setValue, setError, control, reset, clearErrors } = formConfig;

  /**
   * Handle search promotion
   */
  const handleSearchPromotion = () => {
    // TODO
    // setIsShowModal(true);
  };

  /**
   * Handle close modal
   */
  const handleCloseModal = () => {
    setIsShowModal(false);
  };

  /**
   * Handle click button
   */
  const handleClickButton = () => {};

  /**
   *
   */

  elementChangeKeyListener(watch('mixMatchType'));

  const productsWatch = useWatch({
    control,
    name: 'listProduct',
  });

  const optionMixMatchs = useWatch({ control, name: 'options' });

  const dirtyOption = useMemo(() => {
    return optionMixMatchs.some((item) => !isNullOrEmpty(item?.unitsCompleted) || !isNullOrEmpty(item?.priceCompleted));
  }, [optionMixMatchs]);

  /**
   * Count record in table
   */
  const recordTableCount = useMemo(() => {
    return productsWatch.length;
  }, [productsWatch.length]);

  /**
   * When focus out input promotion then call API AP0106
   */
  const handleFocusOutPromotion = () => {
    /**
     * AP0106
     */
    getPromotionDetailAsync();
  };

  const getPromotionDetailAsync = async () => {
    const selectStore = searchParamsObject?.selectStore;
    const promotionCode = getValues('promotionCode');

    return await dispatch(
      getDetailPromotion({
        selected_store: selectStore,
        promotion_code: promotionCode,
      })
    )
      .unwrap()
      .then((response) => {
        if (!response.data.data) {
          return;
        }

        const { name, start_date, end_date, start_time, end_time } = response.data.data;
        setValue('mixMatchName', name);

        setValue('periodTimeMixMatch', {
          startDate: start_date,
          endDate: end_date,
          startTime: start_time,
          endTime: end_time,
        });

        setDefaultData({
          ...defaultValues,
          mixMatchName: name,
          periodTimeMixMatch: {
            startDate: start_date,
            endDate: end_date,
            startTime: start_time,
            endTime: end_time,
          },
        });

        setIsValidPromotionCode(true);
        return response.data.data;
      })
      .catch(() => {
        return null;
      });
  };

  const getGeneratingMixMatchCodeAsync = async (selectStore: string, promotionCode: string) => {
    return await dispatch(
      getGeneratingMixMatchCode({
        selected_store: selectStore,
        promotion_code: promotionCode,
      })
    )
      .unwrap()
      .then((response) => {
        const data = response.data.data;
        if (!data) {
          return;
        }

        setValue('mixMatchCode', response.data.data.mix_match_code);
        setValue('settingMixMatch', response.data.data.settings);

        setDefaultData({
          ...defaultData,
          mixMatchCode: response.data.data.mix_match_code,
          settingMixMatch: response.data.data.settings,
        });
        return response.data.data;
      })
      .catch(() => {
        return null;
      });
  };

  const getSuggestingProductionAsync = async (
    selectStore: string,
    promotionCode: string,
    dataPromotion: IPromotionDetail,
    settingMixMatch: IMixMatchOptionSettings
  ) => {
    await dispatch(
      suggestProduct({
        selected_store: selectStore,
        promotion_code: promotionCode,
        plu: state.plu_code,
      })
    )
      .unwrap()
      .then((response) => {
        const data = response.data.data;

        const listProduct: (ISpecialPromotion & {
          group_code: string;
          product_code: string;
        })[] = [
          {
            store_code: '',
            valid: 0,
            status: '0',
            item_name: data.description,
            discount_method_code: '',
            discount_value: 0,
            special_price: '',
            type_code: '0',
            start_date: '',
            end_date: '',
            company_code: null,
            current_price: data.current_price,
            item_code: data.item_code,
            my_company_code: data?.my_company_code,
            unit_price: data.unit_price,
            group_code: getGroupCode(data?.my_company_code),
            product_code: getProductCode(data?.my_company_code),
          },
        ];

        setValue('listProduct', listProduct);

        setDefaultData({
          ...defaultData,
          mixMatchCode: getValues('mixMatchCode'),
          listProduct,
          mixMatchName: dataPromotion.name,
          periodTimeMixMatch: {
            startDate: dataPromotion.start_date,
            startTime: dataPromotion.start_time,
            endDate: dataPromotion.end_date,
            endTime: dataPromotion.end_time,
          },
          settingMixMatch,
        });
      })
      .catch(() => {});
  };

  /**
   * Function used to call api AP0501
   *
   * @param selectStore The selected store
   * @param promotionCode The promotion code
   * @param mixMatchCode  The mix match code
   * @param dataPromotion
   */
  const getMixMatchDetailAsync = async (
    selectStore: string,
    promotionCode: string,
    mixMatchCode: string,
    dataPromotion: IPromotionDetail
  ) => {
    const pluCode = searchParamsObject?.pluCode;

    await dispatch(
      getMixMatchDetail({
        selected_store: selectStore,
        promotion_code: promotionCode,
        mix_match_code: mixMatchCode,
        item_code: pluCode,
      })
    )
      .unwrap()
      .then((resp) => {
        const data = resp.data.data;
        if (!data) {
          return;
        }

        setValue('settingMixMatch', resp.data.data.settings);
        setValue('mixMatchType', data.type);
        setValue('mixMatchTypeConst', data.type);
        setValue('timeServiceMixMatch', data.time_service);
        setValue('mixMatchStatus', data.status);

        setValue('periodTimeMixMatch', {
          startDate: data.start_date,
          startTime: data.start_time,
          endDate: data.end_date,
          endTime: data.end_time,
        });

        const optionMapping = data.options.map((item: MixMatchDetailOption) => {
          return {
            unitsCompleted: Number(item.quantity),
            priceCompleted: Number(item.price),
          } as OptionsObjectForm;
        });

        setValue('options', optionMapping);

        const record = data.products?.find((item) => item.plu_code === pluCode);

        const listProduct: (ISpecialPromotion & {
          group_code: string;
          product_code: string;
        })[] = [
          {
            store_code: '',
            valid: record.valid,
            status: String(record.status) as unknown as TStatus,
            item_name: record.name,
            discount_method_code: '',
            discount_value: 0,
            special_price: '',
            type_code: '0',
            start_date: '',
            end_date: '',
            company_code: null,
            current_price: record.current_price,
            item_code: record.plu_code,
            my_company_code: record.my_company_code,
            unit_price: record.standard_price,
            group_code: getGroupCode(record.my_company_code),
            product_code: getProductCode(record.my_company_code),
          },
        ];

        if (record) {
          setValue('listProduct', listProduct);
        }

        setDefaultData({
          ...defaultValues,
          mixMatchCode: searchParamsObject?.mixMatchCode,
          mixMatchName: dataPromotion.name,
          periodTimeMixMatch: {
            startDate: data.start_date,
            startTime: data.start_time,
            endDate: data.end_date,
            endTime: data.end_time,
          },
          settingMixMatch: resp.data.data.settings,
          listProduct,
          mixMatchType: data.type,
          mixMatchTypeConst: data.type,
          timeServiceMixMatch: data.time_service,
          mixMatchStatus: data.status,
          options: optionMapping,
        });
      })
      .catch(() => {});
  };

  const mixMatchTypeWatch = watch('mixMatchType');

  const mixMatchOptionAmount = useMemo(() => {
    const settingMixMatch = getValues('settingMixMatch');

    let optionCount = 0;

    if (!settingMixMatch) {
      optionCount = 1;
    } else {
      switch (mixMatchTypeWatch) {
        case '01':
          optionCount = settingMixMatch.type_one;
          break;
        case '02':
          optionCount = settingMixMatch.type_two;
          break;
        case '03':
          optionCount = settingMixMatch.type_three;
          break;
        default:
          break;
      }
    }
    return optionCount;
  }, [mixMatchTypeWatch, getValues('settingMixMatch')]);

  const clearDataOption = () => {
    const options = getValues('options');
    options.forEach((_item, index) => {
      setValue(`options[${index}].unitsCompleted` as keyof FormData, null);
      setValue(`options[${index}].priceCompleted` as keyof FormData, null);

      setError(`options[${index}].unitsCompleted` as keyof FormData, null);
      setError(`options[${index}].priceCompleted` as keyof FormData, null);
    });
  };

  const searchParamsObject = useMemo(() => {
    if (!state || typeof state !== 'object') {
      return undefined;
    }

    const selectStore = state.store_code ?? null;
    const promotionCode = state.promotion_code ?? null;
    const mixMatchCode = state.code ?? null;
    const mode = state.mode ?? null;
    const pluCode = state.plu_code ?? null;

    return {
      selectStore,
      promotionCode,
      mixMatchCode,
      mode,
      pluCode,
    };
  }, [state]);

  const initScreen = async (mode?: string) => {
    const selectStore = searchParamsObject?.selectStore;
    const promotionCode = searchParamsObject?.promotionCode;
    const mixMatchCode = state?.code;
    /**
     * AP0106: Get promotion detail
     */
    if (mode === 'add') {
      const data: IPromotionDetail = await getPromotionDetailAsync();
      /**
       * AP0502: Generate mix match code
       */
      const dataGenCode = await getGeneratingMixMatchCodeAsync(selectStore, promotionCode);

      /**
       * AP1506: Suggest production
       */
      await getSuggestingProductionAsync(selectStore, promotionCode, data, dataGenCode?.settings);
    } else {
      const dataPromotion: IPromotionDetail = await getPromotionDetailAsync();
      /**
       * AP0501
       */
      if (mixMatchCode) {
        await getMixMatchDetailAsync(selectStore, promotionCode, mixMatchCode, dataPromotion);
      }
      setValue('mixMatchCode', mixMatchCode);
    }

    setIsFirstRender(true);
  };

  const focusFirstElement = (isExpand?: boolean) => {
    if (isExpand) return;
    focusElementByName('timeServiceMixMatch');
  };

  const handleUpdateMixMatchPromotion = async () => {
    const { options, listProduct } = getValues();
    let checkError = false;
    formConfig.clearErrors();

    try {
      await validationSchema2.validate(
        {
          listProduct,
          startDateError: watch('startDateError'),
          endDateError: watch('endDateError'),
          startTimeError: watch('startTimeError'),
          endTimeError: watch('endTimeError'),
          endDate: getValues('periodTimeMixMatch.endDate'),
          startDate: getValues('periodTimeMixMatch.startDate'),
          startTime: getValues('periodTimeMixMatch.startTime'),
          endTime: getValues('periodTimeMixMatch.endTime'),
        },
        { abortEarly: false }
      );

      checkError = true;
    } catch (e) {
      if (e instanceof ValidationError) {
        const fieldName = e.inner[0].path ?? '';
        setError(fieldName as keyof FormData, {
          message: localizeFormat(e.inner[0].message, MAPPING_ERROR(extractIndex(fieldName))[fieldName]),
        });
        focusElementByName(fieldName);
        return;
      }
    }

    try {
      await validationSchema.validate(
        {
          options,
        },
        { abortEarly: false }
      );

      checkError = true;
    } catch (e) {
      if (e instanceof ValidationError) {
        const fieldName = e.inner[0].path ?? '';
        setError(fieldName as keyof FormData, {
          message: localizeFormat(e.inner[0].message, MAPPING_ERROR(extractIndex(fieldName))[fieldName]),
        });
        focusElementByName(fieldName);
        return;
      }
    }

    if (!checkError) {
      return;
    }

    const { startDate, endDate, endTime, startTime } = getValues('periodTimeMixMatch');

    const currentTime = Date.now();
    const startDateTemp = new Date(startDate);
    const endDateTemp = new Date(endDate);
    const endDatetimeTemp = new Date(endDate + ' ' + endTime);

    const timeServiceMixMatch = getValues('timeServiceMixMatch');
    const mixMatchType = getValues('mixMatchType');
    const mixMatchStatus = getValues('mixMatchStatus');

    if (startDateTemp.getTime() > endDateTemp.getTime()) {
      setValue('startDateError', localizeFormat('MSG_VAL_051'));
      return;
    } else {
      setValue('startDateError', null);
    }

    if (endDatetimeTemp.getDay() === new Date().getDay() && endDatetimeTemp.getTime() < currentTime) {
      setValue('endTimeError', localizeFormat('MSG_VAL_022'));
      return;
    } else {
      setValue('endTimeError', null);
    }

    if (endDatetimeTemp.getTime() < currentTime) {
      setValue('endDateError', localizeFormat('MSG_VAL_022'));
      return;
    } else {
      setValue('endDateError', null);
    }

    const time1 = new Date(`1970-01-01T${startTime}:00`);
    const time2 = new Date(`1970-01-01T${endTime}:00`);
    const timeServiceTemp = getValues('timeServiceMixMatch');
    const condition1 =
      startDateTemp.getTime() <= endDateTemp.getTime() && time1.getTime() > time2.getTime() && timeServiceTemp === 1;
    const condition2 = startDateTemp.getTime() === endDateTemp.getTime() && time1.getTime() > time2.getTime();

    if (condition1 || condition2) {
      setValue('startTimeError', localizeFormat('MSG_VAL_051'));
      return;
    } else {
      setValue('startTimeError', null);
    }

    const option: MixMatchDetailOption[] = getValues('options')
      .filter((item) => !isNullOrEmpty(item.priceCompleted) || !isNullOrEmpty(item.unitsCompleted))
      .map((item) => ({
        quantity: Number(item.unitsCompleted),
        price: Number(item.priceCompleted),
      }));

    // When no error, clear error status in the input
    clearErrors();

    const product = getValues('listProduct')[0];

    const updated = await dispatch(
      postUpdateMixMatch({
        store_code: searchParamsObject?.selectStore,
        promotion_code: searchParamsObject?.promotionCode,
        code: isAddModeFromOtherScreen ? getValues('mixMatchCode') : searchParamsObject?.mixMatchCode,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        time_service: timeServiceMixMatch,
        type: String(mixMatchType),
        status: mixMatchStatus,
        option,
        product: [
          {
            plu_code: product.item_code,
            status: Number(product.status),
            category_code: getGroupCode(product.my_company_code),
          },
        ],
      })
    )
      .unwrap()
      .then((response) => {
        return response.data.status === STATUS.success;
      })
      .catch(() => {
        return false;
      });

    let isMode = searchParamsObject?.mode === 'add' ? 'add' : 'edit';

    if (updated) {
      // If screen open from SC0101 => go back
      if (state.promotion_code) {
        dispatch(setReloadDataProduct(true));
        // Clear mixMatchs code if saved, avoid call API 0503 delete mixMatchs
        setValue('mixMatchCode', null);
        navigate(-1);
        return;
      }

      if (isMode === 'add') {
        isMode = 'edit';
        const objectState = {
          screen_type: 'fromOtherScreen',
          mode: 'edit',
          store_code: searchParamsObject?.selectStore,
          code: getValues('mixMatchCode'),
          promotion_code: searchParamsObject?.promotionCode ?? '',
          plu_code: searchParamsObject?.pluCode,
        };

        navigate(`/${URL_MAPPING.SC0501}`, {
          state: objectState,
          // replace: true
        });
        setIsFirstRender(true);
      }

      reset();
      initScreen(isMode);
    }
  };

  const extractIndex = (key: string): number => {
    const match = key.match(/\[(\d+)]/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const watched = useWatch({
    control,
  });

  /**
   * Init screen
   */
  useEffect(() => {
    calculationHeightTable();

    const promotionCode = searchParamsObject?.promotionCode;

    setValue('promotionCode', promotionCode);
    focusFirstElement(false);

    if (!isNullOrEmpty(state?.store_code)) {
      dispatch(selectStoreRedux(state?.store_code));
    }
    window.addEventListener('resize', calculationHeightTable);

    return () => {
      window.removeEventListener('resize', calculationHeightTable);
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await initScreen(state?.mode);
    };

    initialize();
  }, [state?.mode]);

  const filterNullOrUndefindItem = (listItem: OptionsObjectForm[]) => {
    return listItem?.filter((item) => Object.values(item).some((value) => value !== undefined && value !== null));
  };

  const isDirtyCheck = useMemo(() => {
    if (isFirstRender) {
      const dataCurrent = {
        ...watched,
        options: filterNullOrUndefindItem(watched.options as OptionsObjectForm[]),
      } as FormData;

      const dataDefaultFilter = {
        ...defaultData,
        options: filterNullOrUndefindItem(defaultData.options),
      } as FormData;

      return !isEqualData(dataCurrent, dataDefaultFilter, compareKey);
    }
  }, [watched, defaultData, isFirstRender]);

  return (
    <Fragment>
      <Header
        title="ミックスマッチ設定"
        hasESC={true}
        printer={{ disabled: true }}
        csv={{ disabled: true }}
        mode={searchParamsObject?.mode === 'edit' ? 'edit' : 'add'}
        confirmBack={isDirtyCheck}
      />
      <FormProvider {...formConfig}>
        <main className="mix-match" ref={divCommonRef}>
          {!state && <SidebarStore expanded={true} />}
          <section className="mix-match__search">
            <div className="mix-match__search-box">
              <div className="mix-match__search-item">
                <label className="mix-match__search-item-label">
                  プロモーションコード<label className="mix-match__required">*</label>
                </label>
                <div className="mix-match__search-item-value">
                  <InputButtonGroup
                    height={50}
                    inputName="promotionCode"
                    handleClickButton={handleSearchPromotion}
                    disabled={screenType}
                    maxLength={5}
                    addZero={true}
                    inputDisabled={isValidPromotionCode}
                    inputFocusOut={handleFocusOutPromotion}
                  />
                  <PopoverLabelText text={watch('mixMatchName')} className={`mix-match__promotion-name`.trim()} />
                </div>
              </div>

              <div className="mix-match__search-item">
                <label className="mix-match__search-item-label ">
                  ミックスマッチコード<label className="mix-match__required">*</label>
                </label>
                <div className="mix-match__search-item-value">
                  <InputButtonGroup
                    height={50}
                    inputName="mixMatchCode"
                    style={{ maxWidth: '200px' }}
                    handleClickButton={handleClickButton}
                    disabled={screenType}
                    maxLength={3}
                  />
                  <ButtonPrimary heightBtn="50px" className="mix-match__button-new" text="新規" disabled={screenType} />
                  <ButtonPrimary
                    heightBtn="50px"
                    className="mix-match__button-plu"
                    text="商品コード切替"
                    disabled={screenType}
                  />

                  <SelectControl
                    name="timeServiceMixMatch"
                    label="タイムサービス"
                    items={TIME_SERVICE_LIST}
                    disabled={false}
                    hasLocalized={true}
                    className="mix-match__dropdown-select"
                  />
                </div>
              </div>
              <div className="mix-match__search-item">
                <label className="mix-match__search-item-label">
                  ミックスマッチ期間<label className="mix-match__required">*</label>
                </label>
                <div className="mix-match__search-item-value">
                  <div className="mix-match__promotion-period">
                    <DateTimeStartEnd
                      type="secondary"
                      onChangeStartDate={(date) => {
                        setValue('periodTimeMixMatch.startDate', convertDateServer(date));
                        setValue('startDateError', null);
                      }}
                      onChangeStartTime={(_time, timeStr?: string) => {
                        setValue('periodTimeMixMatch.startTime', timeStr);
                        setValue('startTimeError', null);
                      }}
                      onChangeEndDate={(date) => {
                        setValue('periodTimeMixMatch.endDate', convertDateServer(date));
                        setValue('endDateError', null);
                      }}
                      onChangeEndTime={(_time, timeStr?: string) => {
                        setValue('periodTimeMixMatch.endTime', timeStr);
                        setValue('endTimeError', null);
                      }}
                      startDate={getValues('periodTimeMixMatch').startDate}
                      endDate={getValues('periodTimeMixMatch').endDate}
                      startTime={getValues('periodTimeMixMatch').startTime}
                      endTime={getValues('periodTimeMixMatch').endTime}
                      errorStartDate={getValues('startDateError')}
                      errorEndDate={getValues('endDateError')}
                      errorStartTime={getValues('startTimeError')}
                      errorEndTime={getValues('endTimeError')}
                    />
                  </div>
                </div>

                <SelectControl
                  name="mixMatchType"
                  label="ミックスマッチ区分"
                  isHiddenCode={true}
                  items={MIX_MATCH_TYPE_LIST}
                  dirtyCheck={dirtyOption}
                  onChange={clearDataOption}
                  disabled={false}
                  hasLocalized={true}
                  className="mix-match__dropdown-select"
                />

                <SelectControl
                  name="mixMatchStatus"
                  label="状態"
                  items={promotionStatus}
                  onChange={(e) => {
                    setValue('mixMatchStatus', e.value as number);
                  }}
                  hasLocalized={true}
                  disabled={screenType}
                />
              </div>
            </div>
            <div className="mix-match__search-box-table ">
              <div className="mix-match__search-item">
                <div className="table-master">
                  <div className="column">
                    <div className="cell header"> &nbsp;</div>
                    <div className="cell">成立個数</div>
                    <div className="cell">成立金額</div>
                  </div>

                  {Array.from({ length: mixMatchOptionAmount }, (_item: number, index) => {
                    return (
                      <div className="column" key={'column' + index}>
                        <div className="cell header">{`第${index + 1}段階`}</div>
                        <div className="cell">
                          <TooltipNumberInputTextControl
                            name={`options[${index}].unitsCompleted`}
                            height="30px"
                            maxLength={2}
                            className="input-table"
                            disabled={false}
                            textAlign="right"
                          />
                        </div>
                        <div className="cell">
                          <TooltipNumberInputTextControl
                            name={`options[${index}].priceCompleted`}
                            height="30px"
                            maxLength={Number(mixMatchTypeWatch) === 2 ? 2 : 8}
                            className="input-table"
                            disabled={false}
                            textAlign="right"
                            minValue={1}
                            thousandSeparator={','}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="mix-match__paging">
            <TableData<ProductPricingInfo>
              data={productsWatch}
              columns={columns}
              tableKey="listProduct"
              enableSelectRow={false}
              disableSingleRecordPadding
            />

            <PagingBottomButton
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              confirmAction={handleUpdateMixMatchPromotion}
              clearAction={() => {
                reset(defaultData);
              }}
              disableNextPage={true}
              disablePrevPage={true}
              disableFirstRow={true}
              disableLastRow={true}
              disableConfirm={!isDirtyCheck}
              disableClear={!isDirtyCheck}
              totalPage={query?.promotionCode ? 0 : recordTableCount}
              total_record={query?.promotionCode ? 0 : recordTableCount}
              page={0}
            />
          </section>
          {isShowModal && (
            <DefaultModal
              headerType={ModalMode.Add}
              titleModal={`label.mixMatchSearch`}
              cancelAction={handleCloseModal}
              confirmAction={() => {}}
              hasBottomButton={false}
            >
              <div className="modal-mix-match__search">
                <div className="wrap-top-label-with-input">
                  <span>プロモーション</span>
                  <InputControl name="test" />
                </div>
                <div className="wrap-top-label-with-input">
                  <span>ミックスマッチ</span>
                  <InputControl name="test2" />
                </div>
                <div className="wrap-top-label-with-input">
                  <span>部門コード</span>
                  <InputControl name="test3" />
                </div>
                <div className="wrap-top-label-with-input">
                  <span>期間</span>
                  <Dropdown
                    isHiddenCode={true}
                    value={'1111'}
                    items={dropdownList && dropdownList}
                    onChange={() => {}}
                    disabled={false}
                  />
                </div>
                <div className="wrap-top-label-with-input">
                  <span>日付</span>
                  <TooltipDatePicker
                    initValue={new Date()}
                    onChange={() => {}}
                    isShortDate={true}
                    inputClassName="date-time-start-end__start-date"
                  />
                </div>
                <div className="modal-mix-match__search-button">
                  <span>&nbsp;</span>
                  <ButtonPrimary heightBtn="50px" className="" text="検索" />
                </div>
              </div>
              <div className="modal-mix-match__list">
                <SpecialPromotionTable<ISpecialPromotion>
                  bodyItems={query?.promotion_code ? addItem(query) : []}
                  disableSelect={true}
                  height={window.innerHeight - 370}
                  columns={[
                    {
                      title: '選択',
                      width: '10%',
                      type: 'button',
                      keyItem: 'valid',
                      mappingValue: promotionValid,
                      alignItem: 'center',
                    },
                    {
                      title: 'プロモーション',
                      width: '20%',
                      keyItem: 'status',
                      type: 'text',
                      alignItem: 'right',
                    },
                    {
                      title: 'ミックスマッチ',
                      width: '18%',
                      keyItem: 'my_company_code',
                      type: 'text',
                      alignItem: 'right',
                    },
                    {
                      title: '代表商品',
                      width: '35%',
                      keyItem: 'item_code',
                      type: 'text',
                      alignItem: 'right',
                    },
                    {
                      title: '開始日時',
                      width: '25%',
                      type: 'text',
                      keyItem: 'item_name',
                      alignItem: 'left',
                    },
                    {
                      title: '終了日時',
                      width: '25%',
                      type: 'text',
                      keyItem: 'special_price',
                      alignItem: 'left',
                      formatNumber: true,
                    },
                    {
                      title: '成立個数・金額',
                      width: '22%',
                      type: 'text',
                      keyItem: 'current_price',
                      alignItem: 'right',
                      formatNumber: true,
                    },
                  ]}
                />
              </div>
            </DefaultModal>
          )}
        </main>
      </FormProvider>
    </Fragment>
  );
};
export default MixMatchSettings;
