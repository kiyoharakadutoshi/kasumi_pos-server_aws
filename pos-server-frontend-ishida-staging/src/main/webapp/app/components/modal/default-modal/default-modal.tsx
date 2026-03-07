import React, { useContext, useEffect, useRef } from 'react';
import {
  ButtonConfirmTitle,
  HeaderModalColor,
  ModalMode,
} from 'app/components/modal/default-modal/default-enum';
import './default-modal.scss';
import '../../button/button.scss';
import { localizeString } from 'app/helpers/utils';
import ButtonHeader from 'app/components/button/button-primary/button-header';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { ErrorState } from 'app/reducers/error';
import { useAppSelector } from 'app/config/store';
import { focusFirstInput, functionKeys } from 'app/helpers/utils-element-html';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';

interface DefaultModalProps {
  zIndex?: number;
  titleModal?: string;
  headerType: ModalMode;
  children?: React.ReactNode;
  confirmTitle?: string;
  confirmAction?: () => void;
  cancelAction?: () => void;
  hasBottomButton?: boolean;
  addHorizontalPadding?: boolean;
  scrollModal?: boolean;
  disableConfirm?: boolean;
  tabEnterListener?: any;
  className?: string;
}

const DefaultModal: React.FC<DefaultModalProps> = ({
  titleModal,
  headerType,
  children,
  confirmTitle,
  confirmAction,
  cancelAction,
  zIndex,
  hasBottomButton = true,
  addHorizontalPadding = true,
  scrollModal = true,
  disableConfirm,
  tabEnterListener,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const errorState: ErrorState = useAppSelector((state) => state.error);
  const { addView, removeView, setKeyboardListener, topView } = useContext(KeyboardViewContext);

  /*
    1. Ignore function key of screen below
    2. Handle add function keydown
   */
  useEffect(() => {
    const handleKeydown = (e: any) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        if (cancelAction) cancelAction();
        return;
      }

      if (functionKeys.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    };
    // Handles canceling window.listener keyboards when modal show
    if (errorState.onCloseModal && topView?.element === modalRef.current) {
      document.addEventListener('keydown', handleKeydown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [errorState.onCloseModal, topView]);

  useEffect(() => {
    addView('modal', modalRef.current);
    focusFirstInput(modalRef);
    return () => {
      removeView('modal');
    };
  }, []);

  useEffect(() => {
    setKeyboardListener(tabEnterListener);
  }, [tabEnterListener]);

  return (
    <div
      className={`default-modal-container ${className ?? ''}`.trim()}
      style={{ zIndex: zIndex ?? 100 }}
      ref={modalRef}
    >
      <div className="default-modal-container__modal-content">
        <div
          className={`default-modal-container__modal-header`}
          style={{ backgroundColor: HeaderModalColor[headerType] }}
        >
          <div>{localizeString(titleModal)}</div>
          <div className="box-button-header">
            <ButtonHeader text={'前画面'} onClick={cancelAction} widthBtn="120px" />
          </div>
        </div>
        <div
          className={`default-modal-container__modal-body ${addHorizontalPadding ? 'default-modal-container__modal-body-padding' : ''} ${scrollModal ? 'default-modal-container__modal-body-scroll' : ''
            }`}
        >
          <div className={scrollModal ? 'default-modal-container__modal-body-content' : ''}>
            {children}
          </div>
          {hasBottomButton && confirmAction && (
            <div className={`default-modal-container__modal-button-bottom button-normal`}>
              <div className="button-normal">
                <ButtonPrimary
                  disabled={disableConfirm}
                  onClick={confirmAction}
                  text={confirmTitle ?? ButtonConfirmTitle[headerType]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultModal;
