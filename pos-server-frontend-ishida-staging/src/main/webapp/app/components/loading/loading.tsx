import React, { useEffect } from 'react';
import './loading.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { NormalButton } from '../button/flat-button/flat-button';
import { hideLoading, LoadingState } from './loading-reducer';
import { functionKeys } from 'app/helpers/utils-element-html';

const ModalLoading = () => {
  const dispatch = useAppDispatch();
  const loading: LoadingState = useAppSelector(state => state.loadingReducer);

  /*
    Ignore function key of screen below
   */

  const handleDisableKeyboard = (e: any) => {
    if (functionKeys.includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  };

  useEffect(() => {

    if (loading.isLoading) {
      document.addEventListener('keydown', handleDisableKeyboard, true);
    }

    return () => {
      document.removeEventListener('keydown', handleDisableKeyboard, true);
    };
  }, [loading.isLoading]);

  return (
    <>
      {loading.isLoading && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="header"></div>
            <div className="spinner"></div>
            {loading.runBackground && (
              <div className="button-bottom">
                <NormalButton text={'Run in background'} onClick={() => dispatch(hideLoading(true))} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ModalLoading;
