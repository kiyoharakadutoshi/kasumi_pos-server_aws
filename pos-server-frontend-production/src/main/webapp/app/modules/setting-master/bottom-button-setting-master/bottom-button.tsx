import React, { useEffect } from 'react';
import './bottom-button.scss';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';

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
  disabledCSV,
  dataChange,
  dirtyCheckAddCashRegister,
  dirtyCheck,
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
  canKeyDown?: boolean; // Avoid opening multiple modal at once
  addCashRegister?: () => void;
  dirtyCheckAddCashRegister?: () => void;
  importCSV?: () => void;
  disabledCSV?: boolean;
  dataChange?: any;
  dirtyCheck?: boolean;
}) => {
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
        if (!disableAdd && addAction && canKeyDown) addAction();
        return;
      }
      if (event.key === 'F1') {
        event.preventDefault();
        if (!disableEdit && addAction && canKeyDown) editAction();
        return;
      }
      if (event.key === 'F11') {
        event.preventDefault();
        if (!disableConfirm && confirmAction && canKeyDown) confirmAction();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disableEdit, disableConfirm, disableAdd, disableCopy, disableDelete, canKeyDown, dataChange]);

  return (
    <div className="bottom-button-setting-master button-normal">
      {addCashRegister && (
        <FuncKeyDirtyCheckButton
          onClickAction={addCashRegister}
          text="action.addCashRegister"
          dirtyCheck={dirtyCheck}
          okDirtyCheckAction={dirtyCheckAddCashRegister}
        />
      )}
      {importCSV && <ButtonPrimary onClick={importCSV} text="action.importCSV" disabled={disabledCSV} />}
      {deleteAction && <ButtonPrimary onClick={deleteAction} disabled={disableDelete} text="action.f10Delete" />}
      {editAction && <ButtonPrimary onClick={editAction} disabled={disableEdit} text="action.f01Edit" />}
      {addAction && <ButtonPrimary onClick={addAction} disabled={disableAdd} text="action.f02Add" />}
      {copyAction && <ButtonPrimary onClick={copyAction} disabled={disableCopy} text="action.f03Copy" />}
      {confirmAction && <ButtonPrimary onClick={confirmAction} disabled={disableConfirm} text="action.f11Confirm" />}
    </div>
  );
};
export default BottomButton;
