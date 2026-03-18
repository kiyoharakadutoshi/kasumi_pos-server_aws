import React, { memo, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { translate } from 'react-jhipster';
import moment from 'moment';
import JsBarcode from 'jsbarcode';

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

// Components
import Header from '@/components/header/header';
import EmployeeModal from '@/modules/employee-setting/employee-modal/employee-modal';

import InputControl from '@/components/control-form/input-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import SelectControl from '@/components/control-form/select-control';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableControl from '@/components/table/table-control';
import ActionsButtonBottom from '@/components/bottom-button/actions-button-bottom';
import CheckboxButton from '@/components/checkbox-button/checkbox-button';
import { KEYDOWN } from '@/constants/constants';
import PopoverText from '@/components/popover/popover';
import ModalCommon, { IModalType } from '@/components/modal/modal-common';

// Redux
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '@/config/store';
import { setError } from '@/reducers/error';
import {
  confirmEmployeeList,
  ListEmployeeRequest,
  getEmployeeList,
  Employee,
} from '@/services/employee-setting-service';

// Utils
import { isNullOrEmpty, localizeString, createJsPDF } from '@/helpers/utils';

// Styles
import './employee-setting.scss';
import { importCSV } from 'app/services/employee-setting-service';
import { hideLoading, showLoading } from 'app/components/loading/loading-reducer';
import { CompanyInfo } from 'app/reducers/user-login-reducer';
import { INAGEYA_CODE, KASUMI_CODE } from 'app/constants/constants';
import { calculateEAN13CheckDigit } from 'app/helpers/utils';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

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

export type EmployeeRecord = {
  recordId: number;
  store: {
    storeCode: string;
    storeName: string;
  };
  employeeCode: string;
  employeeName: string;
  description: string;
  isPrintBarcode: boolean;
  isDelete?: boolean;
  isUpdate?: boolean;
  isCreate?: boolean;
  dataUpdate?: {
    store: {
      storeCode: string;
      storeName: string;
    };
    employeeCode: string;
    employeeName: string;
    description: string;
  };
};

type FormData = {
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
  recordSelected?: EmployeeRecord[];
  confirmStatus: boolean;
  selectedRowId?: string;
  typeDirty: 'search' | 'changeStore';
};

type CellUpdateProps = {
  isUpdate: boolean;
  compareText: boolean;
  value: string;
  updateValue: string;
};

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
  recordSelected: null,
  confirmStatus: true,
  selectedRowId: '',
  typeDirty: 'search',
};

const EditContent = memo(({ isUpdate, compareText, value, updateValue }: CellUpdateProps) => {
  return isUpdate && compareText ? (
    <div className={'edit-row-table'}>
      <p>
        <PopoverText text={value} lineLimit={1} lineHeight={35} />
      </p>
      <p>↓</p>
      <p>
        <PopoverText text={updateValue} lineLimit={1} lineHeight={35} />
      </p>
    </div>
  ) : (
    <PopoverText text={value} lineLimit={1} lineHeight={35} />
  );
});

const columnHelper = createColumnHelper<EmployeeRecord>();
/**
 * The page for employee management settings
 *
 * @returns {JSX.Element} The page for Employee Setting
 */
const EmployeeSetting = () => {
  const dispatch: AppDispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const company: CompanyInfo = useAppSelector((state) => state.loginReducer.selectedCompany);
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);
  const hasStore = !isNullOrEmpty(selectedStores);

  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
  });

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const columns = [
    columnHelper.accessor('store', {
      id: 'store.storeCode',
      cell(info) {
        return (
          <PopoverText
            text={`${info.row.original.store.storeCode} : ${info.row.original.store.storeName}`}
            lineLimit={1}
            lineHeight={35}
          />
        );
      },
      header: (info) => <span>店舗</span>,
      size: 25,
    }),
    columnHelper.accessor((row) => row.employeeCode, {
      id: 'employeeCode',
      cell: (info) => (
        <span style={{ justifyContent: 'end', display: 'flex' }}>{info.getValue()}</span>
      ),
      header: () => <span>従業員コード</span>,
      size: 10,
    }),
    columnHelper.accessor('employeeName', {
      header: () => '従業員名',
      cell(info) {
        const inforValue = info.getValue() || '';
        const employeeName = info.row.original.dataUpdate?.employeeName;
        const compareText = inforValue !== employeeName;

        return (
          <EditContent
            compareText={compareText}
            isUpdate={info.row.original.isUpdate}
            value={inforValue}
            updateValue={info.row.original.dataUpdate ? employeeName : ''}
          />
        );
      },
      size: 30,
    }),
    columnHelper.accessor('description', {
      header: () => <span>従業区分員説明</span>,
      cell(info) {
        const inforValue = info.renderValue() || '';
        const description = info.row.original.dataUpdate?.description;
        const compareText = inforValue !== description;

        return (
          <EditContent
            compareText={compareText}
            isUpdate={info.row.original.isUpdate}
            value={inforValue}
            updateValue={info.row.original.dataUpdate ? description : ''}
          />
        );
      },
      size: 20,
    }),
    columnHelper.accessor('isPrintBarcode', {
      header: '従業員バーコード印刷',
      cell(check) {
        const employeeCodePrint = check.row.original?.employeeCode;
        const storeCode = check.row.original?.store?.storeCode;
        return (
          <CheckboxButton
            checked={check.getValue()}
            onChange={() => {
              const listRecord = tableData;
              const tableTemp =
                listRecord.length > 0 &&
                listRecord.map((item) => {
                  if (
                    item.employeeCode === employeeCodePrint &&
                    item.store?.storeCode === storeCode
                  ) {
                    return {
                      ...item,
                      isPrintBarcode: !item.isPrintBarcode,
                    };
                  }
                  return item;
                });
              setValue('recordSelected', tableTemp);
            }}
          />
        );
      },
      size: 14,
    }),
  ];

  const { getValues, watch, reset, setValue } = formConfig;

  const safeData = useMemo(
    () => (Array.isArray(getValues('recordSelected')) ? getValues('recordSelected') : []),
    [getValues('recordSelected')]
  );

  const canPrint = useMemo(() => {
    return getValues('recordSelected')?.some((item) => item.isPrintBarcode);
  }, [getValues('recordSelected')]);

  const table = useReactTable({
    data: safeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row?.employeeCode + row.store.storeCode,
  });

  const selectedRow = useMemo(() => {
    return selectedRowData;
  }, [selectedRowData]);

  /**
   *
   */
  const closeModal = () => {
    setShowModal(false);
  };
  /*
   * Handle click row table and set data
   *
   * @param {EmployeeRecord} rowData
   */
  const handleRowClick = (rowData: EmployeeRecord) => {
    setSelectedRowId(rowData?.employeeCode + rowData?.store.storeCode);
    setSelectedRowData(rowData);
  };

  /**
   *
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
    doc
      .text(`${moment().format('YYYY/MM/DD HH:mm')}`, doc.internal.pageSize.getWidth() - 60, 20)
      .setFontSize(14);

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
   *
   */
  const handleSearchEmployee = () => {
    setSelectedRowId('');
    setSelectedRowData(null);
    const { employeeCode, employeeCodeType, employeeName, employeeNameType } = getValues();

    const searchParams: Readonly<ListEmployeeRequest> = {
      selected_stores: selectedStores,
      employee_code: employeeCode,
      employee_code_type: employeeCodeType,
      employee_name: employeeName,
      employee_name_type: employeeNameType,
    };

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
              description: employeeItem.description,
              isPrintBarcode: false,
              isDelete: false,
              dataUpdate: null,
              isUpdate: false,
              isCreate: false,
            }) as EmployeeRecord
        );

        setValue('recordSelected', listEmployee);
      })
      .catch((_) => {});
  };

  /**
   *
   */
  const handleConfirm = () => {
    const dataTableConfirm = tableData;
    const dataConfirm = [];

    for (const data of dataTableConfirm) {
      if (data.isDelete && data.isCreate) {
        continue;
      }

      if (data.isDelete && data.isUpdate) {
        dataConfirm.push({
          record_id: data.recordId,
          selected_store: data.store.storeCode,
          employee_code: data?.employeeCode,
          employee_name: data?.employeeName,
          description: data?.description,
          operation_type: '3',
        });
        continue;
      }

      if (data.isDelete) {
        dataConfirm.push({
          record_id: data.recordId,
          selected_store: data.store.storeCode,
          employee_code: data?.employeeCode,
          employee_name: data?.employeeName,
          description: data?.description,
          operation_type: '3',
        });
      }

      if (data.isUpdate) {
        dataConfirm.push({
          record_id: data.recordId,
          selected_store: data.store.storeCode,
          employee_code: data?.dataUpdate.employeeCode,
          employee_name: data?.dataUpdate.employeeName,
          description: data?.dataUpdate.description,
          operation_type: '2',
        });
      }

      if (data.isCreate) {
        dataConfirm.push({
          record_id: null,
          selected_store: data.store.storeCode,
          employee_code: data?.employeeCode,
          employee_name: data?.employeeName,
          description: data?.description,
          operation_type: '1',
        });
      }
    }

    dispatch(confirmEmployeeList({ employee_masters: dataConfirm }))
      .unwrap()
      .then(() => {
        handleSearchEmployee();
      })
      .catch((_) => {});
  };

  /**
   *
   */
  const handleDeleteEmployee = () => {
    const tableTemp = tableData?.map((item) => {
      if (
        item?.employeeCode === selectedRowData?.employeeCode &&
        item?.store?.storeCode === selectedRowData?.store?.storeCode
      ) {
        return {
          ...item,
          isDelete: !item.isDelete,
        };
      }
      return item;
    });

    setValue('recordSelected', tableTemp);
  };

  const tableData = useMemo(() => {
    return getValues('recordSelected');
  }, [watch('recordSelected')]);

  const confirmStatus = useMemo(() => {
    const status = !tableData?.some((item) => item.isCreate || item.isDelete || item.isUpdate);
    return status;
  }, [tableData]);

  /**
   * Clear data when change store
   */
  const handleClearData = () => {
    reset();
    setValue('recordSelected', null);
    setSelectedRowId('');
    setSelectedRowData(null);
  };

  /**
   *
   */
  const handleEditEmployee = () => {
    const recordUpdate = tableData.find(
      (item) =>
        item?.employeeCode === selectedRowData?.employeeCode &&
        item?.store?.storeCode === selectedRowData?.store?.storeCode
    );

    if (recordUpdate.isDelete) {
      dispatch(setError(localizeString('MSG_VAL_010')));
      return;
    }

    const editData = recordUpdate?.isUpdate
      ? {
          ...recordUpdate?.dataUpdate,
          store: recordUpdate?.dataUpdate?.store?.storeCode,
          employeeCode: recordUpdate?.dataUpdate?.employeeCode,
          employeeName: recordUpdate?.dataUpdate?.employeeName,
          description: recordUpdate?.dataUpdate?.description,
        }
      : {
          store: selectedRowData?.store?.storeCode,
          employeeCode: selectedRow?.employeeCode,
          employeeName: selectedRow?.employeeName,
          description: selectedRow?.description,
        };

    setValue('edit', editData);
    setValue('editDefault', editData);
    setShowModal(true);
    setIsEditMode(true);
  };

  /**
   *
   */
  const handleCreateEmployee = () => {
    setValue('add', null);
    setShowModal(true);
    setIsEditMode(false);
  };

  useEffect(() => {
    getValues('recordSelected');
  }, [watch('recordSelected')?.length]);

  /**
   *
   */
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === KEYDOWN.F12) {
        handleCheckDirtySearch();
      }
    };
    handleFocus(false)
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmStatus, selectedStores]);

  const handleFocus = (expand?: boolean) => {
    if (!expand) {
      const input: HTMLInputElement = document.querySelector('[name="employeeCode"]');
      input?.focus();
    }
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
        {showModal && (
          <EmployeeModal
            showModal={showModal}
            closeModal={closeModal}
            isEdit={isEditMode}
            selectedRow={selectedRow}
          />
        )}
        <main className="employee-setting">
          <section className="employee-setting__search">
            <div className="employee-setting__search-group">
              <TooltipNumberInputTextControl
                name="employeeCode"
                className="input-condition-keyword"
                label='label.employeeCode'
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
                onBlur={event => setValue('employeeName', event.target.value.trim())}
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
            <TableControl
              table={table}
              dataTable={tableData}
              onDoubleClickRow={handleEditEmployee}
              selectedRowId={selectedRowId}
              onClickRow={handleRowClick}
              unikeySelected={['employeeCode', 'store.storeCode']}
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
          stateChange={selectedRowData}
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
