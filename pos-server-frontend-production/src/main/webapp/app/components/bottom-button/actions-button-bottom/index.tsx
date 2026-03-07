import React, { useEffect, useRef, useState } from 'react';

import { useAppDispatch } from '@/config/store';
import ButtonPrimary from '../../button/button-primary/button-primary';
import ImportCSVButton from '@/components/button/import-button/import-csv-button';
import { AsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkConfig } from '@reduxjs/toolkit/dist/createAsyncThunk';

// Styles
import './styles.scss';
import '../../button/button.scss';

const ActionsButtonBottom = ({
  disableDelete,
  disableAdd,
  disableCopy,
  disableEdit,
  disableConfirm,
  disableClear,
  deleteAction,
  copyAction,
  addAction,
  editAction,
  confirmAction,
  hasLogout = false,
  canKeyDown = true,
  addCashRegister,
  apiImportCSV,
  exportCSV,
  clearAction,
  hasPagging = false,
  handleNextPage,
  handlePrePage,
  page,
  maxPage,
  onClickPage,
  hasSearchPage = false,
  handleNavigate,
  leftPosition,
  stateChange,
  errNotification,
  children,
  hiddenIcon,
}: {
  disableDelete?: boolean;
  deleteAction?: () => void;
  disableCopy?: boolean;
  copyAction?: () => void;
  disableAdd?: boolean;
  addAction?: () => void;
  disableEdit?: boolean;
  editAction?: () => void;
  disableConfirm?: boolean;
  confirmAction?: () => void;
  hasLogout?: boolean;
  canKeyDown?: boolean;
  addCashRegister?: boolean;
  apiImportCSV?: AsyncThunk<any, FormData, AsyncThunkConfig>;
  exportCSV?: boolean;
  hasPagging?: boolean;
  handleNextPage?: any;
  handlePrePage?: any;
  page?: number;
  maxPage?: number;
  onClickPage?: (pageNumber: number) => void;
  hasSearchPage?: boolean;
  handleNavigate?: (code: string) => void;
  leftPosition?: string;
  stateChange?: any;
  clearAction?: () => void;
  disableClear?: boolean;
  errNotification?: boolean;
  children?: React.ReactNode;
  hiddenIcon?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [canOutFocus, setCanOutFocus] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'F10') {
        event.preventDefault();
        if (!disableDelete && deleteAction && canKeyDown) deleteAction();
        return;
      }
      if (event.key === 'F3') {
        event.preventDefault();
        if (!disableCopy && copyAction && canKeyDown) copyAction();
        return;
      }
      if (event.key === 'F2') {
        event.preventDefault();
        if (hasPagging && canKeyDown) {
          handleNextPage();
          return;
        }
        if (!disableAdd && addAction && canKeyDown) addAction();
        return;
      }
      if (event.key === 'F1') {
        event.preventDefault();
        if (hasPagging && canKeyDown) {
          handlePrePage();
          return;
        }
        if (!disableEdit && addAction && canKeyDown) editAction();
        return;
      }
      if (event.key === 'F11') {
        event.preventDefault();
        if (!disableConfirm && confirmAction && canKeyDown) confirmAction();
        return;
      }

      if (event.key === 'F8') {
        event.preventDefault();
        if (!disableDelete && clearAction && canKeyDown) clearAction();
        return;
      }

      if (event.key === 'F12') {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    disableEdit,
    disableConfirm,
    disableAdd,
    disableCopy,
    disableDelete,
    canKeyDown,
    page,
    hasPagging,
    stateChange,
    disableClear,
  ]);

  const [inputValue, setInputValue] = useState('');
  const preventBlur = useRef(false);
  const triggerNavigate = () => {
    if (!canOutFocus) {
      return;
    }
    handleNavigate(inputValue);
  };
  const handleBlur = (_: any) => {
    if (!preventBlur.current) {
      triggerNavigate();
    }
    preventBlur.current = false;
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      triggerNavigate();
    }
  };
  const handleChange = (value: any) => {
    setInputValue(value);
  };

  // Handle onCLick is preferred over onBlur
  useEffect(() => {
    const handleMouseover = (event: MouseEvent) => {
      let hoveredElement: HTMLElement = event.target as HTMLElement;
      let index = 1;
      while (!hoveredElement?.onclick) {
        index++;
        if (index >= 4) {
          setCanOutFocus(true);
          return;
        }
        hoveredElement = hoveredElement?.parentElement;
      }
      setCanOutFocus(hoveredElement?.hasAttribute('disabled'));
    };

    document.addEventListener('mouseover', handleMouseover);
    return () => {
      document.removeEventListener('mouseover', handleMouseover);
    };
  }, []);

  return (
    <div className="bottom-button" style={{ '--lef-position': leftPosition } as any}>
      <div className="bottom-button__action-button button-normal">
        {children}
        {apiImportCSV && <ImportCSVButton apiImport={apiImportCSV} />}
        {clearAction && (
          <ButtonPrimary
            onClick={clearAction}
            disabled={disableClear}
            text="action.f08Clear"
            tabIndex={0}
          />
        )}
        {deleteAction && (
          <ButtonPrimary
            onClick={deleteAction}
            disabled={disableDelete}
            text="action.f10Delete"
            tabIndex={0}
          />
        )}
        {copyAction && (
          <ButtonPrimary onClick={copyAction} disabled={disableCopy} text="action.f03Copy" />
        )}
        {addAction && (
          <ButtonPrimary onClick={addAction} disabled={disableAdd} text="action.f02Add" />
        )}
        {editAction && (
          <ButtonPrimary onClick={editAction} disabled={disableEdit} text="action.f01Edit" />
        )}
        {confirmAction && (
          <ButtonPrimary
            onClick={confirmAction}
            disabled={disableConfirm}
            text="action.f11Confirm"
            className="element-focus"
            tabIndex={0}
          />
        )}
        {addCashRegister && (
          <ButtonPrimary
            onClick={confirmAction}
            disabled={disableConfirm}
            text="action.addCashRegister"
            tabIndex={0}
          />
        )}
      </div>
    </div>
  );
};
export default ActionsButtonBottom;
