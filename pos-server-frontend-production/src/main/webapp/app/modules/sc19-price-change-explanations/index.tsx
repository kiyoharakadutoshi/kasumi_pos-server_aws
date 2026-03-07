import React, { useMemo, useRef } from 'react';
import { addDays, subDays } from 'date-fns';
import { Row } from '@tanstack/react-table';
import { translate, Translate } from 'react-jhipster';
import { FormProvider, useForm } from 'react-hook-form';

// Components
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import SelectControl from '@/components/control-form/select-control';
import TableData, { RowBase, TableColumnDef } from '@/components/table/table-data/table-data'
import RadioControl from '@/components/control-form/radio-control';
import { IRadioButtonValue } from '@/components/radio-button-component/radio-button';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';

// Utils
import { getFocusableElements } from '@/helpers/utils-element-html';
import { convertDateServer } from '@/helpers/date-utils';

// Styles
import './styles.scss';

export enum Level {
  LevelOne = 1,
  LevelTwo = 2,
  LevelThree = 3,
  LevelFour = 4,
}

export const CHANGE_TYPE_OPTIONS: IDropDownItem[] = [
  {
    name: 'priceChangeExplantions.changeType.allItems',
    value: 0,
  },
  {
    name: 'priceChangeExplantions.changeType.emergencyPriceRevert',
    value: 1,
  },
  {
    name: 'priceChangeExplantions.changeType.specialSaleStart',
    value: 2,
  },
  {
    name: 'priceChangeExplantions.changeType.specialSaleStartT',
    value: 3,
  },
  {
    name: 'priceChangeExplantions.changeType.categoryChange',
    value: 4,
  },
  {
    name: 'priceChangeExplantions.changeType.specialSaleEnd',
    value: 5,
  },
  {
    name: 'priceChangeExplantions.changeType.priceChange',
    value: 6,
  },
  {
    name: 'priceChangeExplantions.changeType.emergencyPrice',
    value: 7,
  },
];

interface PriceChangeExplanationsFormData<TRow extends RowBase> {
  targetDate: string,
  samePrice: number,
  nonPLUCode: number,
  displayOrder: number,
  nonTargetTable?: {
    selectedRows: Row<TRow>[],
  },
  targetTable?: {
    selectedRows: Row<TRow>[],
  },
  selectedRows: Row<TRow>[],
  tableData: DepartmentSetting[]
}

interface DepartmentSetting {
  departmentCode?: string,
  departmentName?: string,
  isNonOutputTarget?: boolean,
}

const DUMMY_DEFAULT_VALUE = Array.from({ length: 13 }, (_, index) => {
  return {
    departmentCode: `${index + 1}`.padStart(2, '0'),
    departmentName: index % 2 === 0 ? `営業部営業部営業部営業部営業部営業部営業部営業部営` : '営業部',
    isNonOutputTarget: true,
  }
})

const DEFAULT_VALUE: PriceChangeExplanationsFormData<DepartmentSetting> = {
  targetDate: convertDateServer(new Date()),
  samePrice: 1,
  nonPLUCode: 0,
  displayOrder: 0,
  selectedRows: null,
  tableData: DUMMY_DEFAULT_VALUE,
};

const SAME_PRICE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'priceChangeExplantions.status.disableOutput',
  },
  {
    id: 1,
    textValue: 'priceChangeExplantions.status.enableOutput',
  },
];

const NON_PLU_CODE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'priceChangeExplantions.status.disableOutput',
  },
  {
    id: 1,
    textValue: 'priceChangeExplantions.status.enableOutput',
  },
];

const DISPLAY_ORDER_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'priceChangeExplantions.displayOrder.classificationStructureOrder',
  },
  {
    id: 1,
    textValue: 'priceChangeExplantions.displayOrder.changeCategoryOrder',
  },
];

const currentDate = new Date();
const maxTargetDate = addDays(currentDate, 7);
const minTargetDate = subDays(currentDate, 3);

/**
 * SC1901: Price change explanation list allows 
 * printing out a list of price changes according to conditions
 *
 * @returns {JSX.Element} The page for price change explanations
 */
const PriceChangeExplanations = (): JSX.Element => {
  // Hook from React
  const containerRef = useRef<HTMLDivElement>(null);
  const divCommonRef = useRef(null);

  // Form Configuration
  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
  });

  const { getValues, watch, setValue } = formConfig;

  // Validation Schema
  // const validationSchema = object<FormDataRevenue>().shape({});

  const columns = React.useMemo<TableColumnDef<DepartmentSetting>[]>(
    () => [
      {
        accessorKey: 'departmentCode',
        header: 'priceChangeExplantions.departmentCode',
        size: 20,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'departmentName',
        header: 'priceChangeExplantions.departmentName',
        size: 80,
        type: 'text',
        textAlign: 'left',
      }
    ],
    []
  );

  /**
   * Function used to focus first element
   */
  const focusFirstElement = () => {
    const element = getFocusableElements(divCommonRef.current) as unknown as HTMLElement[];
    element[0].focus();
  };

  /**
   * Function used to reset selected rows for output target
   */
  const handleSelectRowNonOutputTarget = () => {
    setValue('targetTable.selectedRows', []);
  };

  /**
   * Function used to reset selected rows for nor output target
   */
  const handleSelectRowOutputTarget = () => {
    setValue('nonTargetTable.selectedRows', []);
  };

  /**
   * Function used to select department that want to print for customer
   */
  const handleSelectDepartmentButton = (isSelectAll: boolean = false) => {
    const tableDataTemp = getValues('tableData');
    const nonTargetTableSelectedRows = getValues('nonTargetTable.selectedRows');
    const tableDataUpdate = tableDataTemp.map((item) => {
      if (isSelectAll || (item.departmentCode === nonTargetTableSelectedRows?.[0]?.original.departmentCode)) {
        return {
          ...item,
          isNonOutputTarget: false
        }
      }
      return item;
    });

    setValue('tableData', tableDataUpdate);
    setValue('nonTargetTable.selectedRows', []);
  };

  /**
   * Function used to select department that want to print for customer
   */
  const handleUndoDepartmentButton = (isSelectAll: boolean = false) => {
    const tableDataTemp = getValues('tableData');
    const departmentCodeSelected = getValues('targetTable.selectedRows');
    const tableDataUpdate = tableDataTemp.map((item) => {
      if (isSelectAll || (item.departmentCode === departmentCodeSelected?.[0]?.original.departmentCode)) {
        return {
          ...item,
          isNonOutputTarget: true
        }
      }

      return item;
    });

    setValue('tableData', tableDataUpdate);
    setValue('targetTable.selectedRows', []);
  };

  /**
   * Function used to clear data and focus in first element 
   */
  const handleClearDate = () => {
    formConfig.reset();
    setTimeout(() => {
      focusFirstElement();
    }, 350);
  };

  /**
   * useMemo hook to calculate the state of buhasNonOutputTargetttons based on table data.
   */
  const isCheckEnable = useMemo(() => {
    const listDepartment = watch('tableData');
    const isSelectedNonTargetTable = getValues('nonTargetTable.selectedRows')?.length > 0;
    const isSelectedTargetTable = getValues('targetTable.selectedRows')?.length > 0;
    const hasNonOutputTarget = listDepartment.some((item) => item.isNonOutputTarget);
    const hasOutputTarget = listDepartment.some((item) => !item.isNonOutputTarget);

    return {
      selectButton: !hasNonOutputTarget || !isSelectedNonTargetTable,
      undoButton: !hasOutputTarget || !isSelectedTargetTable,
      selectAllButton: !hasNonOutputTarget,
      deselectedAllButton: !hasOutputTarget
    };
  }, [watch('tableData'), watch('nonTargetTable.selectedRows'), watch('targetTable.selectedRows')]);

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <Header
        title="priceChangeExplantions.header.title"
        csv={{
          disabled: true,
        }}
        hasESC={true}
        printer={{
          disabled: false,
        }}
      />

      <SidebarStore
        expanded={true}
        onChangeCollapseExpand={focusFirstElement}
        actionConfirm={handleClearDate}
      />

      <FormProvider {...formConfig}>
        <main className="main-container price-change-explanations">
          <div className="price-change-explanations__search" ref={divCommonRef}>
            <div className="price-change-explanations__search-box">
              {/* 対象日 */}
              <div className="price-change-explanations__search-item date-time">
                <TooltipDatePickerControl
                  required={true}
                  inputClassName="start-date"
                  name={'targetDate'}
                  labelText="priceChangeExplantions.targetDate"
                  checkEmpty={true}
                  keyError={'priceChangeExplantions.targetDate'}
                  maxDate={maxTargetDate}
                  minDate={minTargetDate}
                  errorPlacement={'right'}
                />
              </div>

              {/* 同一売価 */}
              <div className="price-change-explanations__search-item">
                <label className="label-radio">
                  <Translate contentKey={'priceChangeExplantions.samePrice'} />
                  <span className="text-require">*</span>
                </label>
                <RadioControl
                  isVertical={false}
                  name="samePrice"
                  value={getValues('samePrice')}
                  listValues={SAME_PRICE_OPTION_LIST}
                />
              </div>

              {/* NON-PLUコード */}
              <div className="price-change-explanations__search-item">
                <label className="label-radio">
                  <Translate contentKey={'priceChangeExplantions.nonPLUCode'} />
                  <span className="text-require">*</span>
                </label>
                <RadioControl
                  isVertical={false}
                  name="nonPLUCode"
                  value={getValues('nonPLUCode')}
                  listValues={NON_PLU_CODE_OPTION_LIST}
                />
              </div>

              {/* 変更区分 */}
              <div className="price-change-explanations__search-item">
                <SelectControl
                  name="changeType"
                  className="select-revenue"
                  label="priceChangeExplantions.changeType"
                  items={CHANGE_TYPE_OPTIONS}
                  hasLocalized
                  isRequired
                />
              </div>

              {/* 表示順 */}
              <div className="price-change-explanations__search-item">
                <label className="label-radio">
                  <Translate contentKey={'priceChangeExplantions.displayOrder'} />
                  <span className="text-require">*</span>
                </label>
                <RadioControl
                  isVertical={false}
                  name="displayOrder"
                  value={getValues('displayOrder')}
                  listValues={DISPLAY_ORDER_OPTION_LIST}
                />
              </div>
            </div>
          </div>

          <div className="price-change-explanations__list">
            <div className="price-change-explanations__list-item">
              <h4>{translate('priceChangeExplantions.nonOutputTarget')}</h4>
              <TableData<DepartmentSetting>
                columns={columns}
                data={watch('tableData').filter(item => item.isNonOutputTarget)}
                tableKey="tableData"
                onClickRow={handleSelectRowNonOutputTarget}
                fieldSelectedRowsName='nonTargetTable.selectedRows'
              />
            </div>

            <div className="price-change-explanations__list-item center">
              <div className='price-change-explanations__list-item-child'>
                <ButtonPrimary
                  text='priceChangeExplantions.button.select'
                  iconEnd={<ArrowRight />}
                  onClick={() => handleSelectDepartmentButton()}
                  disabled={isCheckEnable.selectButton}
                />

                <ButtonPrimary
                  text='priceChangeExplantions.button.undo'
                  icon={<ArrowLeft />}
                  onClick={() => handleUndoDepartmentButton()}
                  disabled={isCheckEnable.undoButton}
                />

                <ButtonPrimary
                  text='priceChangeExplantions.button.selectAll'
                  onClick={() => handleSelectDepartmentButton(true)}
                  disabled={isCheckEnable.selectAllButton}
                />

                <ButtonPrimary
                  text='priceChangeExplantions.button.deselectAll'
                  onClick={() => handleUndoDepartmentButton(true)}
                  disabled={isCheckEnable.deselectedAllButton}
                />
              </div>
            </div>

            <div className="price-change-explanations__list-item">
              <h4>{translate('priceChangeExplantions.outputTarget')}</h4>
              <TableData<DepartmentSetting>
                columns={columns}
                data={watch('tableData').filter(item => !item.isNonOutputTarget)}
                tableKey="tableData"
                onClickRow={handleSelectRowOutputTarget}
                fieldSelectedRowsName='targetTable.selectedRows'
              />
            </div>
          </div>
        </main>
      </FormProvider>
    </div>
  );
};
export default PriceChangeExplanations;
