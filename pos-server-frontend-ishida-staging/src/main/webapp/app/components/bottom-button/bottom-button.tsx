import React, { useEffect, useRef, useState } from 'react';
import './bottom-button.scss';
import '../button/button.scss';
import NumberInputText from 'app/components/input/input-text/number-input';
import ButtonPrimary from '../button/button-primary/button-primary';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { localizeString } from 'app/helpers/utils';

export interface IBottomButtonProps {
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
  importCSV?: boolean;
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
  disabledClear?: boolean;
  errNotification?: boolean;
  children?: React.ReactNode;
  hiddenIcon?: boolean;
  dirtyCheckClear?: boolean;
}

const BottomButton = ({
  disableDelete,
  disableAdd,
  disableCopy,
  disableEdit,
  disableConfirm,
  deleteAction,
  copyAction,
  addAction,
  editAction,
  confirmAction,
  canKeyDown = true,
  addCashRegister,
  importCSV,
  exportCSV,
  clearAction,
  disabledClear,
  dirtyCheckClear,
  hasPagging = false,
  handleNextPage,
  handlePrePage,
  page,
  maxPage,
  handleNavigate,
  leftPosition,
  stateChange,
  errNotification,
  children,
}: IBottomButtonProps) => {
  const [canOutFocus, setCanOutFocus] = useState(true);
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'F10') {
        event.preventDefault();
        if (!disableDelete && deleteAction && canKeyDown) deleteAction();
        return;
      }
      if (event.key === 'F8') {
        event.preventDefault();
        if (!disabledClear && clearAction && canKeyDown) clearAction();
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
        if (!disableEdit && editAction && canKeyDown) editAction();
        return;
      }
      if (event.key === 'F11') {
        event.preventDefault();
        if (!disableConfirm && confirmAction && canKeyDown) confirmAction();
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
    disabledClear,
    canKeyDown,
    page,
    hasPagging,
    stateChange,
  ]);
  const [showDirtyCheckClear, setShowDirtyCheckClear] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const preventBlur = useRef(false);
  const triggerNavigate = () => {
    if (!canOutFocus) {
      return;
    }
    handleNavigate(inputValue);
  };
  const handleBlur = () => {
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
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: showDirtyCheckClear,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={() => {
          clearAction?.();
          setShowDirtyCheckClear(false);
        }}
        handleClose={() => setShowDirtyCheckClear(false)}
      />
      <div className="bottom-button__action-button button-normal">
        <div className="bottom-button__pagging">
          <div className="bottom-button__search-page-err">
            {errNotification && <>入力された番号の項目は利用できません</>}
          </div>
          {hasPagging && (
            <>
              <div className={'button-normal'}>
                <ButtonPrimary
                  heightBtn="60px"
                  disabled={page === 1}
                  icon={
                    <svg width="22.5" height="22.5" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10.1475 20.4604L0.147461 10.4604L10.1475 0.460449L12.4808 2.79378L4.81413 10.4604L12.4808 18.1271L10.1475 20.4604Z"
                        fill="white"
                      />
                    </svg>
                  }
                  text="action.F1:前ページ"
                  onClick={handlePrePage}
                />
              </div>
              <div className={'button-normal'}>
                <ButtonPrimary
                  disabled={true}
                  heightBtn={'60px'}
                  icon={
                    <svg width="22.5" height="22.5" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <mask id="mask0_381_28" maskUnits="userSpaceOnUse" x="0" y="0" width="31" height="30">
                        <rect x="0.755859" width="30" height="30" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_381_28)">
                        <path
                          d="M10.2871 8L13.7871 3.46875C14.0371 3.13542 14.334 2.89062 14.6777 2.73438C15.0215 2.57812 15.3809 2.5 15.7559 2.5C16.1309 2.5 16.4902 2.57812 16.834 2.73438C17.1777 2.89062 17.4746 3.13542 17.7246 3.46875L21.2246 8L26.5371 9.78125C27.0788 9.94792 27.5059 10.2552 27.8184 10.7031C28.1309 11.151 28.2871 11.6458 28.2871 12.1875C28.2871 12.4375 28.2506 12.6875 28.1777 12.9375C28.1048 13.1875 27.985 13.4271 27.8184 13.6562L24.3809 18.5312L24.5059 23.6563C24.5267 24.3854 24.2871 25 23.7871 25.5C23.2871 26 22.7038 26.25 22.0371 26.25C21.9954 26.25 21.7663 26.2188 21.3496 26.1563L15.7559 24.5938L10.1621 26.1563C10.0579 26.1979 9.94336 26.224 9.81836 26.2344C9.69336 26.2448 9.57878 26.25 9.47461 26.25C8.80794 26.25 8.22461 26 7.72461 25.5C7.22461 25 6.98503 24.3854 7.00586 23.6563L7.13086 18.5L3.72461 13.6562C3.55794 13.4271 3.43815 13.1875 3.36523 12.9375C3.29232 12.6875 3.25586 12.4375 3.25586 12.1875C3.25586 11.6667 3.4069 11.1823 3.70898 10.7344C4.01107 10.2865 4.43294 9.96875 4.97461 9.78125L10.2871 8Z"
                          fill="white"
                        />
                      </g>
                    </svg>
                  }
                  widthBtn={'100px'}
                />
              </div>
              <div className="bottom-button__search-page">
                <NumberInputText
                  placeholder="00"
                  height="46"
                  width="70"
                  classNameForm="search-page-form"
                  className={`search-page-input ${errNotification ? 'search-page-form-err' : ''}`}
                  onChange={handleChange}
                  focusOut={handleBlur}
                  onKeyDown={handleKeyDown}
                  maxLength={3}
                  autoFocus={true}
                />
              </div>
              <div className={'button-normal'}>
                <ButtonPrimary
                  widthBtn="215px"
                  heightBtn="60px"
                  disabled={page === maxPage}
                  icon={
                    <svg width="22.5" height="22.5" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7.81999 10.4604L0.15332 2.79378L2.48665 0.460449L12.4867 10.4604L2.48665 20.4604L0.15332 18.1271L7.81999 10.4604Z"
                        fill="white"
                      />
                    </svg>
                  }
                  text="action.F2:次ページ"
                  onClick={handleNextPage}
                />
              </div>
            </>
          )}
        </div>
        {children}

        {clearAction && (
          <ButtonPrimary
            onClick={() => {
              if (dirtyCheckClear) {
                setShowDirtyCheckClear(true);
              } else {
                clearAction();
              }
            }}
            disabled={disabledClear}
            text="action.f08Clear"
            className="button-normal__blue"
          />
        )}

        {deleteAction && <ButtonPrimary onClick={deleteAction} disabled={disableDelete} text="action.f10Delete" />}
        {copyAction && <ButtonPrimary onClick={copyAction} disabled={disableCopy} text="action.f03Copy" />}
        {addAction && <ButtonPrimary onClick={addAction} disabled={disableAdd} text="action.f02Add" />}
        {editAction && <ButtonPrimary onClick={editAction} disabled={disableEdit} text="action.f01Edit" />}

        {confirmAction && <ButtonPrimary onClick={confirmAction} disabled={disableConfirm} text="action.f11Confirm" />}

        {addCashRegister && (
          <ButtonPrimary
            onClick={confirmAction}
            disabled={disableConfirm}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="22.5" height="22.5" viewBox="0 0 30 26">
                <path
                  id="Path_83354"
                  data-name="Path 83354"
                  d="M10.836,26.806.345,14.482,2.967,11.4l7.868,9.243L27.722.806l2.623,3.081Z"
                  transform="translate(-0.345 -0.806)"
                  fill="#fff"
                />
              </svg>
            }
            text="action.addCashRegister"
          />
        )}
        {importCSV && (
          <div className="button-normal">
            <ButtonPrimary
              onClick={confirmAction}
              disabled={disableConfirm}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="22.5" height="22.5" viewBox="0 0 30 26">
                  <path
                    id="Path_83354"
                    data-name="Path 83354"
                    d="M10.836,26.806.345,14.482,2.967,11.4l7.868,9.243L27.722.806l2.623,3.081Z"
                    transform="translate(-0.345 -0.806)"
                    fill="#fff"
                  />
                </svg>
              }
              text="action.importCSV"
            />
          </div>
        )}
        {exportCSV && (
          <div className="button-normal">
            <ButtonPrimary
              onClick={confirmAction}
              disabled={disableConfirm}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="22.5" height="22.5" viewBox="0 0 30 26">
                  <path
                    id="Path_83354"
                    data-name="Path 83354"
                    d="M10.836,26.806.345,14.482,2.967,11.4l7.868,9.243L27.722.806l2.623,3.081Z"
                    transform="translate(-0.345 -0.806)"
                    fill="#fff"
                  />
                </svg>
              }
              text="action.exportCSV"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default BottomButton;
