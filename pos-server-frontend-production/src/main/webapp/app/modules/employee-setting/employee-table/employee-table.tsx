import React, { useEffect, useState } from 'react';
import './employee-table.scss';
import { NormalCheckboxButton } from 'app/components/radio-button/radio-button';
import { OperationType } from 'app/modules/master-ticket/data-input';

interface TitleName {
  id: string;
  name: string | React.ReactNode;
}

interface listEmployee {
  operation_type?: number;
  store_name?: string;
  store_code?: string;
  employee_code?: string;
  employee_name?: string;
  employee_name_initial?: string;
  description?: string;
  description_initial?: string;
}

interface NormalTableProps {
  titleTable: TitleName[];
  dataEmployees: listEmployee[];
  onRowSelect?: (row: listEmployee) => void;
  onCheckboxChange?: (selectedRows: listEmployee[]) => void;
  isShowMessageMaxData?: boolean;
}

const EmployeeTable: React.FC<NormalTableProps> = ({ titleTable, dataEmployees, onRowSelect, onCheckboxChange, isShowMessageMaxData }) => {
  const [selectedRow, setSelectedRow] = useState<listEmployee | null>(null);
  const [checkedData, setCheckedData] = useState<listEmployee[]>([]);
  const handleRowClick = (row: listEmployee) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row);
    }
  };
  const classNameTicket = (data: any) => {
    if (data?.operation_type === OperationType.Remove) {
      if (data?.operation_type_before === 1 || data?.operation_type_before === 2) {
        return 'record-remove-new';
      }
      return 'record-remove';
    }
    if (data?.operation_type === OperationType.New) {
      return 'record-new';
    }
    return '';
  };

  const handleCheckboxChange = (row: listEmployee) => {
    const isChecked = checkedData.some(item => item.employee_code === row.employee_code);
    if (isChecked) {
      setCheckedData(checkedData.filter(item => item.employee_code !== row.employee_code));
    } else {
      setCheckedData([...checkedData, row]);
    }
  };
  const LayoutData = (initialData: string, newData: string, operationType: number) => {
    return operationType === OperationType.Edit && initialData !== newData ? (
      <div className={'record-new data-item'}>
        {initialData}
        <div className={`data-item ${initialData ? '' : 'update-text'}`}>↓</div>
        {newData}
      </div>
    ) : (
      <>{newData}</>
    );
  };

  useEffect(() => {
    if (onCheckboxChange) {
      onCheckboxChange(checkedData);
    }
  }, [checkedData]);

  return (
    <>
      <div className={'table-notice'}>{isShowMessageMaxData && '検索結果が1000件を超えたため、 最初の1000件を表示しています。'}</div>

      <div className={`employee-table-container`}>
        <table className={'table table-responsive table-employee-setting table-striped'}>
          <thead className={'title-table table-secondary'}>
            <tr className={'header-table'}>
              {titleTable?.map((data, index) => {
                return (
                  <th key={index} scope="col">
                    {data?.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          {dataEmployees?.length > 0 && (
            <tbody className={'data-table'}>
              {dataEmployees?.map((dataEmployee, index) => {
                const isSelected = selectedRow?.employee_code === dataEmployee.employee_code;
                const isChecked = checkedData.some(item => item.employee_code === dataEmployee.employee_code);

                return (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(dataEmployee)}
                    className={`row-data-table ${classNameTicket(dataEmployee)} ${isSelected ? 'table-primary' : ''}`}
                  >
                    <td className={'data-item'} scope="row">{`${dataEmployee?.store_code}: ${dataEmployee?.store_name}`}</td>
                    <td className={'data-item'}>{dataEmployee?.employee_code}</td>
                    <td className={'data-item'} title={dataEmployee?.employee_name}>
                      {LayoutData(dataEmployee?.employee_name_initial, dataEmployee?.employee_name, dataEmployee?.operation_type)}
                    </td>
                    <td className={'data-item'} title={dataEmployee?.description}>
                      {LayoutData(dataEmployee?.description_initial, dataEmployee?.description, dataEmployee?.operation_type)}
                    </td>
                    <td className={'data-item'}>
                      <div className={'checkbox-center'}>
                        <NormalCheckboxButton
                          id={dataEmployee.employee_code}
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(dataEmployee)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};

export default EmployeeTable;
