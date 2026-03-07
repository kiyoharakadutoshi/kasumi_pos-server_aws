import React, { useEffect } from 'react';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import './bottom-deposit-withdraw.scss';

const BottomDepositWithdraw = ({
                                 dataChange ,
                                 disableProps,
                                 actionProps,
}) => {
  const { disableClear, disableAdd, disableDelete, disableEdit, disableConfirm } = disableProps ?? {};
  const { clearAction, addAction, editAction, deleteAction, confirmAction } = actionProps ?? {};

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const keyActionMap = {
        F8: { disabled: disableClear, action: clearAction },
        F10: { disabled: disableDelete, action: deleteAction },
        F2: { disabled: disableAdd, action: addAction },
        F1: { disabled: disableEdit, action: editAction },
        F11: { disabled: disableConfirm, action: confirmAction },
      };

      const config = keyActionMap[event.key];

      if (!config) return;

      event.preventDefault();
      if (!config.disabled && config.action) {
        config.action();
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
    disableDelete,
    disableConfirm,
    clearAction,
    deleteAction,
    addAction,
    editAction,
    confirmAction,
  ]);


  return (
    <div id="bottom-deposit-withdraw">
      <FuncKeyDirtyCheckButton
        funcKey={null}
        onClickAction={clearAction}
        text="action.f08Clear"
        dirtyCheck={dataChange}
        okDirtyCheckAction={clearAction}
      />
      <ButtonPrimary onClick={deleteAction} disabled={disableDelete} text="action.f10Delete" />
      <ButtonPrimary onClick={addAction} disabled={disableAdd} text="action.f02Add" />
      <ButtonPrimary onClick={editAction} disabled={disableEdit} text="action.f01Edit" />
      <ButtonPrimary onClick={confirmAction} disabled={disableConfirm} text="action.f11Confirm" />
    </div>
  );
};

export default BottomDepositWithdraw;
