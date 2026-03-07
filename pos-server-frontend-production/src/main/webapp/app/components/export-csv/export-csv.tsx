import React from 'react';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import './export-csv.scss';
import { useDispatch } from 'react-redux';
import { setError } from 'app/reducers/error';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { KEYDOWN } from 'app/constants/constants';

export interface ExportCsvProps {
  listTitleTable?: string[];
  csvData?: any;
  fileName?: string;
  color?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}

export const ExportCSV: React.FC<ExportCsvProps> = ({ listTitleTable, csvData, fileName, color, width, height, disabled }) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';
  const dispatch = useDispatch();

  const exportToCSV = (listTitleTable: string[], csvData: any, fileName: string) => {
    if (disabled) {
      return;
    }
    if (isNullOrEmpty(csvData) || csvData === undefined || csvData.some(data => isNullOrEmpty(data))) {
      dispatch(setError(localizeString('MSG_ERR_007')));
      return;
    }
    // Change key from listTitleTable to csvData
    csvData?.map((dataRow: any) => {
      let index = 0;
      const keys = Object.keys(dataRow);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        dataRow[listTitleTable[index]] = dataRow[key];
        delete dataRow[key];
        index++;
      }
    });
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const onKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KEYDOWN.Space) {
      event.preventDefault();
      event.stopPropagation();
      exportToCSV(listTitleTable, csvData, fileName);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeydown}
      className={`${disabled ? 'csv-disabled' : 'csv-enable'}`}
      onClick={() => exportToCSV(listTitleTable, csvData, fileName)}
    >
      <svg className="csv-icon" width="42" height="34" viewBox="0 0 42 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.98047 23.25H14.2305V20.125H9.02213V13.875H14.2305V10.75H7.98047C7.39019 10.75 6.8954 10.9496 6.49609 11.3489C6.09679 11.7482 5.89713 12.243 5.89713 12.8333V21.1666C5.89713 21.7569 6.09679 22.2517 6.49609 22.651C6.8954 23.0503 7.39019 23.25 7.98047 23.25ZM16.1055 23.25H22.3555C22.9457 23.25 23.4405 23.0503 23.8398 22.651C24.2391 22.2517 24.4388 21.7569 24.4388 21.1666V18.0416C24.4388 17.4514 24.2391 16.9045 23.8398 16.401C23.4405 15.8975 22.9457 15.6458 22.3555 15.6458H19.2305V13.875H24.4388V10.75H18.1888C17.5985 10.75 17.1037 10.9496 16.7044 11.3489C16.3051 11.7482 16.1055 12.243 16.1055 12.8333V15.9583C16.1055 16.5486 16.3051 17.0781 16.7044 17.5468C17.1037 18.0156 17.5985 18.25 18.1888 18.25H21.3138V20.125H16.1055V23.25ZM29.8555 23.25H32.9805L36.6263 10.75H33.5013L31.418 17.9375L29.3346 10.75H26.2096L29.8555 23.25ZM4.33463 33.6666C3.1888 33.6666 2.2079 33.2586 1.39193 32.4427C0.575955 31.6267 0.167969 30.6458 0.167969 29.5V4.49997C0.167969 3.35414 0.575955 2.37324 1.39193 1.55726C2.2079 0.741291 3.1888 0.333305 4.33463 0.333305H37.668C38.8138 0.333305 39.7947 0.741291 40.6107 1.55726C41.4266 2.37324 41.8346 3.35414 41.8346 4.49997V29.5C41.8346 30.6458 41.4266 31.6267 40.6107 32.4427C39.7947 33.2586 38.8138 33.6666 37.668 33.6666H4.33463Z" />
      </svg>
    </div>
  );
};

export const CustomExportCSV = ({ disabled, handleExportSCVByApi }) => {
  const onKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === KEYDOWN.Space) {
      event.preventDefault();
      event.stopPropagation();
      handleExportSCVByApi();
    }
  };

  return (
    <div tabIndex={0} className={`${disabled ? 'csv-disabled' : 'csv-enable'}`} onClick={handleExportSCVByApi} onKeyDown={onKeydown}>
      <svg className="csv-icon" width="42" height="34" viewBox="0 0 42 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.98047 23.25H14.2305V20.125H9.02213V13.875H14.2305V10.75H7.98047C7.39019 10.75 6.8954 10.9496 6.49609 11.3489C6.09679 11.7482 5.89713 12.243 5.89713 12.8333V21.1666C5.89713 21.7569 6.09679 22.2517 6.49609 22.651C6.8954 23.0503 7.39019 23.25 7.98047 23.25ZM16.1055 23.25H22.3555C22.9457 23.25 23.4405 23.0503 23.8398 22.651C24.2391 22.2517 24.4388 21.7569 24.4388 21.1666V18.0416C24.4388 17.4514 24.2391 16.9045 23.8398 16.401C23.4405 15.8975 22.9457 15.6458 22.3555 15.6458H19.2305V13.875H24.4388V10.75H18.1888C17.5985 10.75 17.1037 10.9496 16.7044 11.3489C16.3051 11.7482 16.1055 12.243 16.1055 12.8333V15.9583C16.1055 16.5486 16.3051 17.0781 16.7044 17.5468C17.1037 18.0156 17.5985 18.25 18.1888 18.25H21.3138V20.125H16.1055V23.25ZM29.8555 23.25H32.9805L36.6263 10.75H33.5013L31.418 17.9375L29.3346 10.75H26.2096L29.8555 23.25ZM4.33463 33.6666C3.1888 33.6666 2.2079 33.2586 1.39193 32.4427C0.575955 31.6267 0.167969 30.6458 0.167969 29.5V4.49997C0.167969 3.35414 0.575955 2.37324 1.39193 1.55726C2.2079 0.741291 3.1888 0.333305 4.33463 0.333305H37.668C38.8138 0.333305 39.7947 0.741291 40.6107 1.55726C41.4266 2.37324 41.8346 3.35414 41.8346 4.49997V29.5C41.8346 30.6458 41.4266 31.6267 40.6107 32.4427C39.7947 33.2586 38.8138 33.6666 37.668 33.6666H4.33463Z" />
      </svg>
    </div>
  );
};
