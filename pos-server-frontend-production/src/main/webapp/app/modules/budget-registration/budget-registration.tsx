// === External Libraries ===
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, Resolver, useForm, useWatch } from 'react-hook-form';
import { object, string } from 'yup';

// === Application Components ===
import Header from 'app/components/header/header';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import BottomButton from 'app/components/bottom-button/bottom-button';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import SelectControl from '@/components/control-form/select-control';
import { PopoverLabelText, PopoverTextControl } from 'app/components/popover/popover';

// === Redux and State Management ===
import { useAppDispatch, useAppSelector } from '@/config/store';

// === Services ===
import { getHierarchyList } from '@/services/master-category-service';
import { getBudgetList, saveBudget } from '@/services/budget-registration-service';

// === Utilities and Constants ===
import {
  blurInputWithTimeout,
  focusElementByNameWithTimeOut,
  isEqual,
  isNullOrEmpty,
  localizeString,
} from 'app/helpers/utils';
import { getFocusableElements, handleFocusListElement } from '@/helpers/utils-element-html';
import { NOT_FOUND_CODE } from 'app/constants/api-constants';

// === Styles ===
import './budget-registration.scss';

// === Interface ===
import { IBudgetRegistrationTable } from './budget-registration-interface';
import { fullDateToSortDate } from 'app/helpers/date-utils';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import CompareForm from 'app/components/compare-form/compare-form';
import { BUDGET_AMOUNT_MAX_LENGTH, YEAR_LENGTH } from 'app/constants/constants';

interface FormData {
  searchCondition?: {
    settingMonth: 1;
    productGroup: string;
    productGroupName: string;
  };

  budgetData?: IBudgetRegistrationTable[];
  budgetDataDefault?: IBudgetRegistrationTable[];
  disableConfirm?: boolean;
  isDirty?: boolean;
}

const DEFAULT_VALUE: FormData = {
  searchCondition: {
    settingMonth: 1,
    productGroup: '',
    productGroupName: '',
  },

  budgetData: [],
  budgetDataDefault: [],
  disableConfirm: true,
  isDirty: false,
};

function getCurrentAndNextMonth(): string[] {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const formattedCurrentMonth = `${currentYear}年${String(currentMonth).padStart(2, '0')}月`;

  let nextYear = currentYear;
  let nextMonth = currentMonth + 1;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const formattedNextMonth = `${nextYear}年${String(nextMonth).padStart(2, '0')}月`;

  return [formattedCurrentMonth, formattedNextMonth];
}

const [formattedCurrentMonth, formattedNextMonth] = getCurrentAndNextMonth();

const SETTING_MONTH = [
  {
    name: formattedCurrentMonth,
    value: 1,
  },
  {
    name: formattedNextMonth,
    value: 2,
  },
];

function dayOfMonth(monthOfYear: string): number {
  const year = Number(monthOfYear.substring(0, 4));
  const month = Number(monthOfYear.substring(5, 7));
  return new Date(year, month, 0).getDate();
}

function compareString(string1: string, string2: string): number {
  const rowIndex: number[] = [];
  const colIndex: number[] = [];

  [string1, string2].forEach((str) => {
    const matches = str.match(/\d+/g);
    if (matches) {
      matches.forEach((num, index) => {
        const value = parseInt(num, 10);
        if (index === 0) {
          rowIndex.push(value);
        } else {
          colIndex.push(value);
        }
      });
    }
  });

  return colIndex[0] * 10 + rowIndex[0] - (colIndex[1] * 10 + rowIndex[1]);
}

export const BudgetRegistration = () => {
  const dispatch = useAppDispatch();

  const stores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);

  const validationSchema = object<FormData>().shape({
    'searchCondition.productGroup': string().required('MSG_VAL_001'),
  });

  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_VALUE,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });
  const { watch, reset, control } = formConfig;
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);
  const [isDisableSearch, setIsDisableSearch] = useState(false);

  const [isDisabledButtonSearch, setIsDisabledButtonSearch] = useState(true);
  const [totalBudgetThisCategory, setTotalBudgetThisCategory] = useState(0);
  const [totalBudgetAll, setTotalBudgetAll] = useState(0);
  const [initialBudget, setInitialBudget] = useState(0);
  const [, setInitialBudgetInfo] = useState([]);

  const disableClear = useMemo(() => {
    const searchCondition = formConfig.getValues('searchCondition');
    return searchCondition?.settingMonth === 1 && isNullOrEmpty(searchCondition?.productGroup);
  }, [useWatch({ control, name: 'searchCondition' })]);

  const ref = useRef(null);

  const monthAndYear = SETTING_MONTH[Number(formConfig.getValues('searchCondition.settingMonth')) - 1].name;
  const year = Number(monthAndYear.substring(0, 4));
  const month = Number(monthAndYear.substring(5, 7));
  const applyDate = `${year}/${month.toString().padStart(2, '0')}/01`;

  useEffect(() => {
    let focusableElements = null;

    setTimeout(() => {
      focusableElements = getFocusableElements(ref?.current, false).sort((a, b) => {
        const nameA = a.getAttribute('name');
        const nameB = b.getAttribute('name');

        if (nameA == null || nameB == null) {
          return a.compareDocumentPosition(b) && Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
        } else if (nameA.includes('budgetData') && nameB.includes('budgetData')) {
          return compareString(nameA, nameB);
        }
      });
    }, 150);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        handleFocusListElement(focusableElements, e);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleFocusListElement(focusableElements, e);
        return;
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [watch('budgetData')]);

  useEffect(() => {
    if (isNullOrEmpty(stores?.[0])) return;

    setTimeout(() => {
      focusFirstElement(false);
    }, 100);
  }, []);

  const focusFirstElement = (isExpand: boolean, isDirty?: boolean) => {
    if (isExpand || isDirty) return;
    const element: HTMLButtonElement = document.querySelector('.dropdown-container__dropdown-button');
    element?.focus();
  };

  // === Update budget_info to array ===
  const updateBudgetInfoFromRegistrationTable = (
    result: IBudgetRegistrationTable[]
  ): { apply_date: string; budget: number }[] => {
    const items = [];
    const budgetsDefault: IBudgetRegistrationTable[] = formConfig.getValues('budgetDataDefault');
    // === convert day and month must have 2 digits ===
    const monthUpdated = month.toString().padStart(2, '0');
    for (let i = 0; i < result.length; i++) {
      const row = result[i];

      if (row.col1DayOfMonth && !isEqual(row.col1BudgetAmount, budgetsDefault?.[i]?.col1BudgetAmount)) {
        const apply_date = `${year.toString().slice(YEAR_LENGTH)}/${monthUpdated}/${row.col1DayOfMonth.replace('日', '').toString().padStart(2, '0')}`;
        const budget = parseInt(row.col1BudgetAmount, 10);
        items.push({ apply_date, budget });
      }

      if (row.col2DayOfMonth && !isEqual(row.col2BudgetAmount, budgetsDefault?.[i]?.col2BudgetAmount)) {
        const apply_date = `${year.toString().slice(YEAR_LENGTH)}/${monthUpdated}/${row.col2DayOfMonth.replace('日', '').toString().padStart(2, '0')}`;
        const budget = parseInt(row.col2BudgetAmount, 10);
        items.push({ apply_date, budget });
      }

      if (row.col3DayOfMonth && !isEqual(row.col3BudgetAmount, budgetsDefault?.[i]?.col3BudgetAmount)) {
        const apply_date = `${year.toString().slice(YEAR_LENGTH)}/${monthUpdated}/${row.col3DayOfMonth.replace('日', '').toString().padStart(2, '0')}`;
        const budget = parseInt(row.col3BudgetAmount, 10);
        items.push({ apply_date, budget });
      }
    }

    items.sort((a, b) => new Date(a.apply_date).getTime() - new Date(b.apply_date).getTime());

    return items.map((item) => ({
      record_id: null,
      ...item,
    }));
  };

  /**
   * Generates a monthly budget overview from the provided budget data.
   * @param {Array} budgetData - An array of budget objects, each containing a
   *                             date (date) and budget amount (budget).
   * @returns {Array} - An array of IBudgetRegistration objects that contain information
   *                    about the day of the month, weekday, and corresponding budget amount.
   */
  const generateMonthlyBudgetOverview = (
    budgetData: { apply_date: string; budget: number }[]
  ): IBudgetRegistrationTable[] => {
    const totalDays = new Date(year, month, 0).getDate();
    const length = totalDays > 30 ? 11 : 10;
    const adjustedMonth = month - 1;

    const dataTable: IBudgetRegistrationTable[] = Array.from({ length }, (_, dayIndex) => {
      const day1 = dayIndex + 1;
      const date1 = new Date(year, adjustedMonth, day1);
      const weekDay1 = date1.toLocaleString('ja-JP', { weekday: 'short' });

      const day2 = day1 + 10;
      const date2 = new Date(year, adjustedMonth, day2);
      const weekDay2 = date2.toLocaleString('ja-JP', { weekday: 'short' });

      const day3 = day1 + 20;
      const date3 = new Date(year, adjustedMonth, day3);
      const weekDay3 = date3.toLocaleString('ja-JP', { weekday: 'short' });

      return {
        col1DayOfMonth: day1 > 10 ? null : `${day1}日`,
        col1DayOfWeek: day1 > 10 ? null : weekDay1,
        col2DayOfMonth: day2 > 20 ? null : `${day2}日`,
        col2DayOfWeek: day2 > 20 ? null : weekDay2,
        col3DayOfMonth: day3 > totalDays ? null : `${day3}日`,
        col3DayOfWeek: day3 > totalDays ? null : weekDay3,
      };
    });

    budgetData.forEach((item) => {
      const date = new Date(item.apply_date);
      if (date.getFullYear() === year && date.getMonth() === adjustedMonth) {
        const day = date.getDate();
        const indexCol = day > 30 ? 3 : Math.floor((day - 1) / 10) + 1;
        const indexRow = day > 30 ? 10 : (day - 1) % 10;
        dataTable[indexRow][`col${indexCol}BudgetAmount`] = item.budget;
      }
    });
    return dataTable;
  };

  /**
   * Calculates the total budget from the provided budget data.
   * @returns {number} - The total budget, calculated as the sum of all the budget amounts
   *                     from the provided budget data.
   */

  const totalBudget = (budgetData) => {
    if (!Array.isArray(budgetData)) {
      return 0;
    }

    return budgetData.reduce((sum, item) => {
      const clu1 = parseFloat(item.col1BudgetAmount || '0');
      const clu2 = parseFloat(item.col2BudgetAmount || '0');
      const clu3 = parseFloat(item.col3BudgetAmount || '0');
      return sum + clu1 + clu2 + clu3;
    }, 0);
  };

  /**
   * Handles changes to the input value in the budget registration form.
   */
  const handleInputChange = () => {
    const budgetData = formConfig.getValues('budgetData');
    const totalCategory = totalBudget(budgetData);
    const total = totalCategory + initialBudget;
    setTotalBudgetThisCategory(totalCategory);
    setTotalBudgetAll(total);
  };

  const columns = React.useMemo<TableColumnDef<IBudgetRegistrationTable>[]>(() => {
    return [
      {
        accessorKey: 'col1DayOfMonth',
        header: 'budgetRegistration.table.monthDay',
        size: 10,
        type: 'text',
      },
      {
        accessorKey: 'col1DayOfWeek',
        header: 'budgetRegistration.table.weekDay',
        size: 10,
        type: 'text',
      },
      {
        accessorKey: 'col1BudgetAmount',
        header: 'budgetRegistration.table.budgetAmount',
        size: 15,
        type: 'inputNumber',
        inputTextProps: {
          maxLength: BUDGET_AMOUNT_MAX_LENGTH,
          textAlign: 'right',
          disabledIfHasRecordId: true,
          addZero: false,
          focusOut: handleInputChange,
          checkError: true,
          thousandSeparator: true,
          allowLeadingZeros: false,
        },
      },
      {
        accessorKey: 'col2DayOfMonth',
        header: 'budgetRegistration.table.monthDay',
        type: 'text',
        size: 10,
      },
      {
        accessorKey: 'col2DayOfWeek',
        header: 'budgetRegistration.table.weekDay',
        type: 'text',
        size: 10,
      },
      {
        accessorKey: 'col2BudgetAmount',
        header: 'budgetRegistration.table.budgetAmount',
        size: 15,
        type: 'inputNumber',
        inputTextProps: {
          maxLength: BUDGET_AMOUNT_MAX_LENGTH,
          textAlign: 'right',
          disabledIfHasRecordId: true,
          addZero: false,
          thousandSeparator: true,
          checkError: true,
          focusOut: handleInputChange,
          allowLeadingZeros: false,
        },
      },
      {
        accessorKey: 'col3DayOfMonth',
        header: 'budgetRegistration.table.monthDay',
        type: 'text',
        size: 10,
      },
      {
        accessorKey: 'col3DayOfWeek',
        header: 'budgetRegistration.table.weekDay',
        type: 'text',
        size: 10,
      },
      {
        accessorKey: 'col3BudgetAmount',
        header: 'budgetRegistration.table.budgetAmount',
        size: 15,
        type: 'inputNumber',

        inputTextProps: {
          maxLength: BUDGET_AMOUNT_MAX_LENGTH,
          textAlign: 'right',
          disabledIfHasRecordId: true,
          addZero: false,
          thousandSeparator: true,
          checkError: true,
          focusOut: handleInputChange,
          allowLeadingZeros: false,
        },
      },
    ];
  }, [initialBudget]);

  /**
   * Call api based on product group to provide budget list
   * @returns {boolean} - Returns true if budget information was set successfully,
   *                      otherwise updates the form with an error message.
   */
  const handleSearch = () => {
    const productGroup = formConfig.getValues('searchCondition.productGroup');
    dispatch(
      getBudgetList({
        selected_store: stores?.[0],
        apply_date: fullDateToSortDate(applyDate),
        md_hierarchy_code: productGroup,
      })
    )
      .unwrap()
      .then((res) => {
        const result = res?.data?.data;
        if (result?.items) {
          const defaultData = generateMonthlyBudgetOverview(result.items);
          formConfig.resetField('budgetData');
          formConfig.setValue('budgetData', defaultData);
          formConfig.setValue('budgetDataDefault', defaultData);
          const initialBudgetTotal = (result.total_budget_all_category ?? 0) - (result.total_budget_this_category ?? 0);
          setInitialBudgetInfo(result.items);
          setInitialBudget(initialBudgetTotal);
          setTotalBudgetThisCategory(result.total_budget_this_category);
          setTotalBudgetAll(result.total_budget_all_category);
          setIsDisableSearch(true);
          focusElementByNameWithTimeOut('budgetData[0].col1BudgetAmount', 50);
        } else {
          formConfig.setValue('searchCondition.productGroupName', localizeString('MSG_ERR_001'));
        }
      })
      .catch(() => {});
  };

  /**
   * Suggests a department based on the provided product group.
   *
   * @returns {void} - This function does not return any value.
   */

  const suggestGroupCode = () => {
    setIsDisabledButtonSearch(true);
    const productGroup = formConfig.getValues('searchCondition.productGroup');
    if (isNullOrEmpty(productGroup)) {
      formConfig.setValue('searchCondition.productGroupName', '');
      return;
    }

    dispatch(
      getHierarchyList({
        filter_code: productGroup,
        // level: 1,
        store_code: stores?.[0],
      })
    )
      .unwrap()
      .then((res) => {
        setErrorSearch(false);
        const hierarchyLevelData = res?.data?.data;
        if (hierarchyLevelData?.items && hierarchyLevelData?.items?.length > 0) {
          setIsDisabledButtonSearch(false);
          formConfig.setValue('searchCondition.productGroupName', hierarchyLevelData.items[0]['description_level_one']);
          // Focus button F12 Search when suggest success
          focusElementByNameWithTimeOut('action.f12Search', 50);
        } else {
          setErrorSearch(true);
          formConfig.setValue('searchCondition.productGroupName', localizeString('MSG_ERR_001'));
        }
      })
      .catch((error) => {
        if (error.response?.status === NOT_FOUND_CODE) {
          formConfig.setValue('searchCondition.productGroupName', '');
        } else {
          setErrorSearch(true);
          formConfig.setError('searchCondition.productGroupName', localizeString('MSG_ERR_001'));
        }
      });
  };

  const setErrorSearch = (isError: boolean) => {
    formConfig.setError(
      'searchCondition.productGroupName',
      isError ? { message: localizeString('MSG_ERR_001') } : null
    );
  };

  /**
   * Handles the save budget action for either creating a new budget
   * or updating an existing one based on the presence of a record ID.
   *
   * @returns {void} - This function does not return any value.
   */
  const handleSaveBudget = () => {
    const productGroup = formConfig.getValues('searchCondition.productGroup');

    const updatedBudgetInfo = updateBudgetInfoFromRegistrationTable(formConfig.getValues('budgetData'));
    setInitialBudgetInfo(updatedBudgetInfo);
    const body = {
      store_code: stores?.[0],
      apply_date: fullDateToSortDate(applyDate),
      md_hierarchy_code: productGroup,
      items: updatedBudgetInfo,
    };
    dispatch(saveBudget(body))
      .unwrap()
      .then(() => {
        handleSearch();
      })
      .catch(() => {});
  };

  /**
   * Resets the form and clears associated data.
   * @returns {void} - This function does not return any value.
   */
  const handleReset = () => {
    formConfig.setValue('budgetData', []);
    reset();
    setIsDisableSearch(false);
    setIsDisabledButtonSearch(true);
    setTimeout(() => {
      focusFirstElement(false, false);
    }, 50);
  };

  /**
   * Resets the form and clears associated data.
   * @returns {void} - This function does not return any value.
   */
  const handleClearData = () => {
    formConfig.setValue('budgetData', []);
    reset();
    setIsDisableSearch(false);
    setIsDisabledButtonSearch(true);

    setTimeout(() => {
      focusFirstElement(false, false);
    }, 350);
  };

  return (
    <FormProvider {...formConfig}>
      <div className="budget-registration" ref={ref}>
        <ModalCommon
          modalInfo={{
            type: IModalType.confirm,
            isShow: showDirtyCheck,
            message: localizeString('MSG_CONFIRM_002'),
          }}
          handleOK={() => {
            handleReset();
            setShowDirtyCheck(false);
          }}
          handleClose={() => setShowDirtyCheck(false)}
        />
        <Header
          hasESC={true}
          title="budgetRegistration.title"
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          hiddenTextESC={true}
          confirmBack={watch('isDirty')}
        />

        <div className={'budget-registration__main'}>
          {/* Sidebar */}

          <SidebarStore
            onClickSearch={() => {}}
            expanded={true}
            onChangeCollapseExpand={focusFirstElement}
            selectMultiple={false}
            actionConfirm={handleClearData}
            hasData={watch('budgetData').length > 0}
          />

          {/* Input search */}
          <div className={'budget-registration__search'}>
            <div className={'budget-registration__setting-month'}>
              <SelectControl
                name="searchCondition.settingMonth"
                className="budget-registration__setting-month-selection"
                label={localizeString('budgetRegistration.conditionSearchLabel.settingMonth')}
                items={SETTING_MONTH.map((item) => ({ ...item, name: item.name.slice(YEAR_LENGTH) }))}
                isRequired
                hasBlankItem={false}
                disabled={isDisableSearch}
              />
            </div>
            <div className={'budget-registration__product-group'}>
              <div className={'budget-registration__product-group-level'}>
                <TooltipNumberInputTextControl
                  name="searchCondition.productGroup"
                  className="budget-registration__code-group"
                  label={localizeString('budgetRegistration.conditionSearchLabel.productGroup')}
                  maxLength={2}
                  addZero={true}
                  required={true}
                  disabled={isDisableSearch}
                  focusOut={() => suggestGroupCode()}
                  onMaxLength={() => blurInputWithTimeout(true)}
                />
              </div>
              <PopoverTextControl name="searchCondition.productGroupName" />
            </div>
            <div className={'budget-registration-button'}>
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                onClickAction={handleSearch}
                disabled={isDisabledButtonSearch}
                name={'action.f12Search'}
                dirtyCheck={watch('isDirty')}
                okDirtyCheckAction={handleSearch}
              />
            </div>
          </div>

          {/* Table */}
          <div className="budget-registration__table">
            <TableData<IBudgetRegistrationTable>
              columns={columns}
              data={watch('budgetData')}
              enableSelectRow={false}
              tableKey="budgetData"
              rowConfig={() => {
                return {
                  className:
                    'number-day-of-month-' +
                    dayOfMonth(SETTING_MONTH[Number(formConfig.getValues('searchCondition.settingMonth')) - 1].name),
                };
              }}
              showNoData={false}
            />
          </div>

          {/* Table info */}
          {watch('budgetData').length > 0 && { isDisableSearch } && (
            <div className="budget-registration__total-info">
              <PopoverLabelText
                formatedNumber={false}
                label="budgetRegistration.table.totalByMonth"
                text={totalBudgetAll.toLocaleString('en-US') + localizeString('budgetRegistration.unit')}
                className="budget-registration__total-by-month"
                textAlign={'end'}
              />
              <PopoverLabelText
                formatedNumber={false}
                label="budgetRegistration.table.totalByProductGroup"
                text={totalBudgetThisCategory.toLocaleString('en-US') + localizeString('budgetRegistration.unit')}
                className="budget-registration__total-by-product-group"
                textAlign={'end'}
              />
            </div>
          )}
        </div>
        {/* Footer */}
        <BottomButton
          leftPosition="455px"
          clearAction={() => {
            if (formConfig.getValues('isDirty')) {
              setShowDirtyCheck(true);
            } else {
              handleReset();
            }
          }}
          confirmAction={() => handleSaveBudget()}
          disableConfirm={watch('disableConfirm')}
          disabledClear={disableClear}
        />
      </div>
      <BudgetCompare />
    </FormProvider>
  );
};

const BudgetCompare = () => {
  return (
    <CompareForm
      name="budgetData"
      nameCompare="budgetDataDefault"
      paramsEqual={['col1BudgetAmount', 'col2BudgetAmount', 'col3BudgetAmount']}
    />
  );
};

export default BudgetRegistration;
