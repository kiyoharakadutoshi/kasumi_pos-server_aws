import './paging-bottom-button.scss';
import React, { useEffect, useState } from 'react';
import BottomButton from '../bottom-button';
import { localizeString } from 'app/helpers/utils';
import {
  ClearButton,
  FirstRowButton,
  LastRowButton,
  NextPageButton,
  PrevPageButton,
} from 'app/components/bottom-button/icon-bottom-button';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { Controller, useFormContext } from 'react-hook-form';

type ActionType = 'clear' | 'first' | 'last' | 'prev' | 'next';

export interface IPagingBottomButtonProps {
  disableConfirm?: boolean;
  confirmAction?: () => void;
  disableClear?: boolean;
  clearAction?: () => void;
  disablePrevPage?: boolean;
  actionPaging?: (action: 'next' | 'prev' | 'first' | 'last') => void;
  disableNextPage?: boolean;
  disableFirstRow?: boolean;
  disableLastRow?: boolean;
  totalPage?: number;
  total_record?: number;
  page?: number;
  limit?: number;
  children?: React.ReactNode;
  dataChange?: any;
}

const PagingBottomButton = (props: IPagingBottomButtonProps) => {
  const disableFirstRowButton = props?.disableFirstRow || !props?.total_record || props?.total_record === 0 || props?.page === 1;
  const disableLastRowButton = props?.disableLastRow || !props?.total_record || props?.total_record === 0 || props?.page >= props?.totalPage;
  const disablePrevButton = props?.disablePrevPage || props?.page <= 1;
  const disableNextButton = props?.disableNextPage || props?.total_record === 0 || props?.page > props?.totalPage || (props?.page === props?.totalPage && props?.total_record % props?.limit !== 0);

  const [showDirtyCheck, setShowDirtyCheck] = useState(false);
  const [dirtyCheckType, setDirtyCheckType] = useState<ActionType>(null);

  useEffect(() => {
    const handleFuncKey = (event: KeyboardEvent) => {
      if (event.key === 'F8') {
        event.preventDefault();
        if (!props?.disableClear) {
          handleDirtyCheck('clear');
        }
        return;
      }

      if (event.key === 'F3') {
        event.preventDefault();
        if (!disableFirstRowButton) {
          handleDirtyCheck('first');
        }
        return;
      }

      if (event.key === 'F4') {
        event.preventDefault();
        if (!disableLastRowButton) {
          handleDirtyCheck('last');
        }
        return;
      }

      if (event.key === 'F1') {
        event.preventDefault();
        if (!disablePrevButton) {
          handleDirtyCheck('prev');
        }
        return;
      }

      if (event.key === 'F2') {
        event.preventDefault();
        if (!disableNextButton) {
          handleDirtyCheck('next');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleFuncKey);
    return () => {
      window.removeEventListener('keydown', handleFuncKey);
    };
  }, [props?.disableConfirm, props?.disableClear, props?.disableNextPage, props?.disablePrevPage, disableLastRowButton, disableFirstRowButton, props?.dataChange]);

  const handleDirtyCheck = (type: ActionType) => {

    switch (type) {
      case 'clear':
        if (!props.disableConfirm) {
          setShowDirtyCheck(true);
          setDirtyCheckType(type);
          return;
        }

        if (props?.clearAction) props?.clearAction();
        break;
      default:
        if (props?.actionPaging) props?.actionPaging(type);
        break;
    }
  };

  const dirtyCheckAction = () => {
    switch (dirtyCheckType) {
      case 'clear':
        if (props?.clearAction) props?.clearAction();
        break;
      default:
        if (props?.actionPaging) props?.actionPaging(dirtyCheckType);
        break;
    }
  };

  return (
    <BottomButton
      stateChange={props?.dataChange}
      disableConfirm={props?.disableConfirm}
      confirmAction={props?.confirmAction}
      hiddenIcon={true}
    >
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: showDirtyCheck,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={() => {
          dirtyCheckAction();
          setShowDirtyCheck(false);
        }}
        handleClose={() => setShowDirtyCheck(false)}
      />
      {props?.total_record > 0 && (
        <label className="bottom-button__label-page-container">
          <label className="bottom-button__label-page">
            {props?.total_record ?? 0}
            {localizeString('pagingTable.in')}
          </label>
          {props?.page > 1 && (
            <label className="bottom-button__label-page">
              1～{props?.page}
              {localizeString('pagingTable.item')}
            </label>
          )}
        </label>
      )}
      {props?.children}
      <ClearButton disabledClear={props?.disableClear} clearAction={() => handleDirtyCheck('clear')} />
      <FirstRowButton disabledFirstRow={disableFirstRowButton} firstRowAction={() => handleDirtyCheck('first')} />
      <LastRowButton disabledLastRow={disableLastRowButton} lastRowAction={() => handleDirtyCheck('last')} />
      <PrevPageButton disabledPrevPage={disablePrevButton} prevPageAction={() => handleDirtyCheck('prev')} />
      <NextPageButton disabledNextPage={disableNextButton} nextPageAction={() => handleDirtyCheck('next')} />
    </BottomButton>
  );
};

interface IPagingBottomControlProps extends IPagingBottomButtonProps {
  confirmName: string;
}

export const PagingBottomButtonControl = (props: IPagingBottomControlProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => <PagingBottomButton {...props} disableConfirm={field.value}/>}
      control={control}
      name={props.confirmName}
    />
  );
};
export default PagingBottomButton;
