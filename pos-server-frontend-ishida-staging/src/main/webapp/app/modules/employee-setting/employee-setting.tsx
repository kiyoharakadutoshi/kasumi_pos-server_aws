import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { translate } from 'react-jhipster';
import moment from 'moment';
import JsBarcode from 'jsbarcode';

// Components
import Header from '@/components/header/header';
import EmployeeModal from '@/modules/employee-setting/employee-modal/employee-modal';

import InputControl from '@/components/control-form/input-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import SelectControl from '@/components/control-form/select-control';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import ActionsButtonBottom from '@/components/bottom-button/actions-button-bottom';
import { KEYDOWN } from '@/constants/constants';
import ModalCommon, { IModalType } from '@/components/modal/modal-common';

// Redux
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/config/store';
import { setError } from '@/reducers/error';
import {
  confirmEmployeeList,
  Employee,
  getEmployeeList,
  ListEmployeeRequest,
} from '@/services/employee-setting-service';

// Utils
import { createJsPDF, isNullOrEmpty, localizeString } from '@/helpers/utils';

// Styles
import './employee-setting.scss';
import { importCSV } from 'app/services/employee-setting-service';
import { hideLoading, showLoading } from 'app/components/loading/loading-reducer';
import { CompanyInfo } from 'app/reducers/user-login-reducer';
import { INAGEYA_CODE, KASUMI_CODE } from 'app/constants/constants';
import { calculateEAN13CheckDigit, localizeFormat } from 'app/helpers/utils';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TableData, { RowBase, TableColumnDef } from 'app/components/table/table-data/table-data';
import { OperationType } from 'app/components/table/table-common';
import { FormTableDataBase } from 'app/modules/user-setting/interface-user';

export const EMPLOYEE_TYPE_OPTIONS: IDropDownItem[] = [
  {
    name: 'を含む',
    value: 0,
    code: '0',
  },
  {
    name: 'から始まる',
    value: 1,
    code: '1',
  },
  {
    name: 'で終わる',
    value: 2,
    code: '2',
  },
];

export interface EmployeeRecord extends RowBase {
  recordId: number;
  store: {
    storeCode: string;
    storeName: string;
  };
  employeeCode: string;
  employeeName: string;
  description?: string;
  isPrintBarcode: boolean;
}

export interface FormData extends FormTableDataBase<EmployeeRecord> {
  employeeCode: string;
  employeeCodeType: number;
  employeeName: string;
  employeeNameType: number;
  edit?: {
    store: string;
    employeeCode: string;
    employeeName: string;
    description: string;
  };
  editDefault?: {
    store: string;
    employeeCode: string;
    employeeName: string;
    description: string;
  };
  add?: {
    store: string;
    employeeCode: string;
    employeeName: string;
    description: string;
  };
  employees?: EmployeeRecord[];
  employeesDefault?: EmployeeRecord[];
  confirmStatus: boolean;
  selectedRowId?: string;
  typeDirty: 'search' | 'changeStore';
  is_exceed_records?: boolean;
}

const DEFAULT_VALUE: FormData = {
  employeeCode: '',
  employeeCodeType: 0,
  employeeName: '',
  employeeNameType: 0,
  edit: {
    store: '',
    employeeCode: '',
    employeeName: '',
    description: '',
  },
  add: {
    store: '',
    employeeCode: '',
    employeeName: '',
    description: '',
  },
  employees: null,
  confirmStatus: true,
  selectedRowId: '',
  typeDirty: 'search',
};

/**
 * The page for employee management settings
 *
 * @returns {JSX.Element} The page for Employee Setting
 */
const EmployeeSetting = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const company: CompanyInfo = useAppSelector((state) => state.loginReducer.selectedCompany);
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);
  const hasStore = !isNullOrEmpty(selectedStores);

  const formConfig = useForm({ defaultValues: DEFAULT_VALUE });

  const { getValues, watch, reset, setValue, control } = formConfig;

  const tableData = useMemo(() => {
    return getValues('employees');
  }, [watch('employees')]);

  const columns1 = React.useMemo<TableColumnDef<EmployeeRecord>[]>(
    () => [
      {
        accessorKey: 'store',
        header: '店舗',
        type: 'text',
        size: 25,
        option(props, recordDefault) {
          const store = props?.row?.original?.store;

          return {
            value: `${store?.storeCode}：${store?.storeName}`,
            defaultValue: `${recordDefault?.store?.storeCode}：${recordDefault?.store?.storeName}`,
          };
        },
        textAlign: 'left',
      },
      {
        accessorKey: 'employeeCode',
        textAlign: 'right',
        header: '従業員コード',
        size: 10,
      },
      {
        accessorKey: 'employeeName',
        type: 'text',
        header: '従業員名',
        size: 30,
        textAlign: 'left',
      },
      {
        accessorKey: 'description',
        header: '従業区分員説明',
        size: 20,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'isPrintBarcode',
        header: '従業員バーコード印刷',
        type: 'checkbox',
        size: 15,
      },
    ],
    [watch('employeesDefault'), tableData]
  );

  const dataWatch = useWatch({ control, name: 'employees' });

  const canPrint = useMemo(() => {
    return dataWatch?.some((item) => item.isPrintBarcode);
  }, [dataWatch]);

  const selectedRow = useMemo(() => {
    return getValues('selectedRows')?.[0]?.original;
  }, [watch('selectedRows')]);

  /**
   *
   */
  const closeModal = () => {
    setShowModal(false);
  };

  /**
   * Action print
   */
  const handlePrint = (dataTableParams: EmployeeRecord[]) => {
    dispatch(showLoading({}));
    setTimeout(() => {
      const dataPrinting = dataTableParams.filter((item) => item.isPrintBarcode === true);
      if (dataPrinting?.length > 0) {
        printData(dataPrinting);
      } else {
        dispatch(setError(localizeString('MSG_VAL_008')));
      }
      dispatch(hideLoading({}));
    }, 50);
  };

  /**
   * Create file pdf employee
   * @param dataTableParams
   */
  const printData = (dataTableParams: EmployeeRecord[]) => {
    // Config file PDF
    const doc = createJsPDF('portrait');

    // Create header at first page
    const headerText = '従業員バーコード一覧表';
    const headerTextWidth = doc.getTextWidth(headerText);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - 5;
    const maxHeight = pageHeight - 10;
    const headerX = (pageWidth - headerTextWidth) / 2;
    doc.text(headerText, headerX, 38).setFontSize(16);
    doc.text(`${moment().format('YYYY/MM/DD HH:mm')}`, doc.internal.pageSize.getWidth() - 60, 20).setFontSize(14);

    // Init value
    const firstPositionX = 8;
    const firstPositionY = 15;
    const widthBarcode = 65;
    const heightBarcode = 35;
    const maxWidthText = widthBarcode - 5;

    // Set position to start create barcode
    let x = firstPositionX;
    let y = firstPositionY + 30;

    // function cut overflow text
    const cutText = (text: string) => {
      let newText = text;
      let textWidth = doc.getTextWidth(newText);
      if (textWidth > maxWidthText) {
        while (textWidth > maxWidthText && newText.length > 0) {
          newText = newText.slice(0, -1);
          textWidth = doc.getTextWidth(newText + '...');
        }
        newText += '...';
      }
      return newText;
    };

    dataTableParams?.forEach((data, index) => {
      // Create frame, code, name of barcode
      doc.rect(x, y, widthBarcode, heightBarcode);
      doc.text(`${data?.employeeCode}`, x + 3, y + 6);
      doc.text(`${cutText(data?.employeeName)}`, x + 3, y + 13);

      // Create barcode
      const barcodeText = createBarcode(data?.employeeCode ?? '');
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, barcodeText, {
        width: 30,
        height: 20,
        displayValue: false,
        margin: 0,
      });

      const barcodeDataUri = canvas.toDataURL('image/jpeg');
      const binaryData = atob(barcodeDataUri.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      doc.addImage(uint8Array, 'JPEG', x + 3, y + 17, widthBarcode - 6, 10);
      // Always center the barcode
      const barcodeTextWidth = doc.getTextWidth(barcodeText);
      doc.text(barcodeText, x + (widthBarcode - barcodeTextWidth) / 2, y + 33);
      // End create barcode

      // Move new position create new barcode
      x += widthBarcode;
      if (x + widthBarcode > maxWidth) {
        x = firstPositionX;
        y += heightBarcode;
      }

      // Add page if exceed size
      if (y > maxHeight && index < dataTableParams.length - 1) {
        doc.addPage();
        x = firstPositionX;
        y = firstPositionY;
      }
    });

    // Add text total page at first page
    const totalPage = doc.getNumberOfPages() ?? 1;
    doc.setPage(1);
    doc.text(`ページ: ${totalPage}`, doc.internal.pageSize.getWidth() - 60, 28).setFontSize(12);

    // Creat file
    doc.save('PR4001_従業員バーコード.pdf');
  };

  /**
   *
   */
  const handleCheckDirtySearch = () => {
    if (confirmStatus === false) {
      setShowDirtyCheck(true);
      setValue('typeDirty', 'search');
    } else {
      setShowDirtyCheck(false);
      handleSearchEmployee();
    }
  };

  /**
   * Create code employee for barcord
   * @param code
   */
  const createBarcode = (code: string) => {
    if (company?.code === KASUMI_CODE) return `${company?.employeeBarCode}${code}`;

    if (company?.code === INAGEYA_CODE) {
      const barcode = `${company?.employeeBarCode}${code}0`;
      const checkDigits = calculateEAN13CheckDigit(barcode);
      return `${barcode}${checkDigits ?? ''}`;
    }
    return '';
  };

  /**
   * Action Search
   */
  const handleSearchEmployee = () => {
    const { employeeCode, employeeCodeType, employeeName, employeeNameType } = getValues();

    const searchParams: Readonly<ListEmployeeRequest> = {
      selected_stores: selectedStores,
      employee_code: employeeCode,
      employee_code_type: employeeCodeType,
      employee_name: employeeName,
      employee_name_type: employeeNameType,
    };

    setValue('selectedRows', null);

    dispatch(getEmployeeList(searchParams))
      .unwrap()
      .then((response) => {
        const listEmployee = response?.data?.data?.items?.map(
          (employeeItem: Employee) =>
            ({
              recordId: employeeItem.record_id,
              store: {
                storeCode: employeeItem.store_code,
                storeName: employeeItem.store_name,
              },
              employeeCode: employeeItem.employee_code,
              employeeName: employeeItem.employee_name,
              description: employeeItem.description ?? '',
              isPrintBarcode: false,
            }) as EmployeeRecord
        );

        if (isNullOrEmpty(listEmployee)) {
          setValue('showNoData', true);
        }

        setValue('employees', listEmployee);
        setValue('employeesDefault', listEmployee);
        setValue('is_exceed_records', response?.data?.data?.is_exceed_records);
      })
      .catch(() => {
        setValue('showNoData', true);
      });
  };

  /**
   * Action confirm
   */
  const handleConfirm = () => {
    const employee_masters = tableData
      ?.filter((item: EmployeeRecord) => item?.operation_type)
      .map((item) => ({
        employeeCode: item.employeeCode,
        employeeName: item.employeeName,
        isPrintBarcode: item.isPrintBarcode,
        operation_type: item.operation_type,
        operation_type_before: item.operation_type_before,
        selected_store: item?.store?.storeCode,
      }));

    dispatch(confirmEmployeeList({ employee_masters }))
      .unwrap()
      .then(() => {
        handleSearchEmployee();
      })
      .catch(() => {});
  };

  /**
   * Action delete employee
   */
  const handleDeleteEmployee = () => {
    const dataTemp = getValues('employees');
    const { row, index } = getSelectedEmployee();
    if (!row) return;

    dataTemp[index] = {
      ...row,
      operation_type: row?.operation_type === OperationType.Remove ? row?.operation_type_before : OperationType.Remove,
    };
    setValue('employees', dataTemp);
  };

  const confirmStatus = useMemo(() => {
    return !tableData?.some((item) => item?.operation_type);
  }, [tableData]);

  /**
   * Clear data when change store
   */
  const handleClearData = () => {
    reset();
    setValue('employees', null);
  };

  /**
   * Action edit employee
   */
  const handleEditEmployee = () => {
    const { row: recordUpdate } = getSelectedEmployee();
    if (!recordUpdate) return;

    if (recordUpdate.operation_type === OperationType.Remove) {
      dispatch(setError(localizeString('MSG_VAL_010')));
      return;
    }

    const editData = {
      store: recordUpdate?.store?.storeCode,
      employeeCode: recordUpdate?.employeeCode,
      employeeName: recordUpdate?.employeeName,
      description: recordUpdate?.description,
    };

    setValue('edit', editData);
    setValue('editDefault', editData);
    setShowModal(true);
    setIsEditMode(true);
  };

  /**
   * Action create employee
   */
  const handleCreateEmployee = () => {
    setValue('add', null);
    setShowModal(true);
    setIsEditMode(false);
  };

  /**
   * Action keydown F12
   */
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === KEYDOWN.F12) {
        handleCheckDirtySearch();
      }
    };
    handleFocus(false);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStores]);

  /**
   * Focus first element when change store
   * @param expand
   */
  const handleFocus = (expand?: boolean) => {
    if (!expand) {
      const input: HTMLInputElement = document.querySelector('[name="employeeCode"]');
      input?.focus();
    }
  };

  /**
   * Get selected employee
   */
  const getSelectedEmployee = () => {
    const dataTemp = getValues('employees');
    if (isNullOrEmpty(dataTemp)) return;
    const index = getValues('selectedRows')?.[0]?.index;
    const row = dataTemp?.[index];

    if (!row) {
      dispatch(setError(localizeFormat('MSG_VAL_019', 'employeeSetting.employee')));
      return null;
    }
    return { row, index };
  };

  return (
    <div className={'employee-setting'}>
      <Header
        csv={{ disabled: true }}
        title={'employeeSetting.title'}
        confirmBack={!confirmStatus}
        hasESC={true}
        printer={{
          action() {
            handlePrint(tableData);
          },
          disabled: !canPrint,
        }}
      />
      <SidebarStore
        selectMultiple
        onClickSearch={() => {}}
        firstSelectStore={() => {}}
        expanded={true}
        actionConfirm={handleClearData}
        hasData={tableData?.length > 0}
        onChangeCollapseExpand={handleFocus}
      />
      <FormProvider {...formConfig}>
        {showModal && <EmployeeModal showModal={showModal} closeModal={closeModal} isEdit={isEditMode} />}
        <main className="employee-setting">
          <section className="employee-setting__search">
            <div className="employee-setting__search-group">
              <TooltipNumberInputTextControl
                name="employeeCode"
                className="input-condition-keyword"
                label="label.employeeCode"
                width={'100%'}
                height={'50px'}
                maxLength={7}
                disabled={!hasStore}
              />

              <SelectControl
                name="employeeCodeType"
                items={EMPLOYEE_TYPE_OPTIONS}
                isHiddenCode={true}
                onChange={(e) => e.value}
                value={getValues('employeeCodeType')}
                disabled={!hasStore}
              />
            </div>
            <div className="employee-setting__search-group">
              <InputControl
                name="employeeName"
                className="input-condition-keyword"
                labelText={translate('label.employeeName')}
                widthInput={'100%'}
                heightInput={'50px'}
                maxLength={50}
                disabled={!hasStore}
                onBlur={(event) => setValue('employeeName', event.target.value.trim())}
              />

              <SelectControl
                name="employeeNameType"
                items={EMPLOYEE_TYPE_OPTIONS}
                isHiddenCode={true}
                onChange={(e) => e.value}
                value={getValues('employeeNameType')}
                disabled={!hasStore}
              />

              <ButtonPrimary
                className="search-button"
                text="label.searchF12"
                onClick={handleCheckDirtySearch}
                disabled={!hasStore}
              />
            </div>
          </section>
          <section className="employee-setting__list">
            <TableData
              columns={columns1}
              data={tableData}
              defaultData={watch('employeesDefault')}
              onDoubleClick={handleEditEmployee}
              tableKey={'employees'}
              showNoData={watch('showNoData')}
              isExceedRecords={watch('is_exceed_records')}
            />
          </section>
        </main>
        <ActionsButtonBottom
          apiImportCSV={importCSV}
          deleteAction={handleDeleteEmployee}
          disableDelete={isNullOrEmpty(selectedRow)}
          disableEdit={isNullOrEmpty(selectedRow)}
          editAction={handleEditEmployee}
          addAction={handleCreateEmployee}
          disableAdd={!hasStore}
          confirmAction={handleConfirm}
          disableConfirm={confirmStatus}
          stateChange={selectedRow}
        />

        <ModalCommon
          modalInfo={{
            type: IModalType.confirm,
            isShow: showDirtyCheck,
            message: localizeString('MSG_CONFIRM_002'),
          }}
          handleOK={() => {
            switch (getValues('typeDirty')) {
              case 'changeStore':
                handleClearData();
                break;
              case 'search':
                handleSearchEmployee();
                break;
              default:
                break;
            }

            setShowDirtyCheck(false);
          }}
          handleClose={() => {
            setShowDirtyCheck(false);
          }}
        />
      </FormProvider>
    </div>
  );
};

export default EmployeeSetting;
