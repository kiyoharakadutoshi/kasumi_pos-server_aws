import React, { useContext, useEffect, useRef, useState } from 'react';
import SidebarStoreDefault from 'app/components/sidebar-store-default/sidebar-store-default';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { IStoreInfo, resetSelectedStore, setSelectedStore } from 'app/reducers/store-reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { focusFirstInput, functionKeys } from 'app/helpers/utils-element-html';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { Controller, useFormContext } from 'react-hook-form';
import './sidebar-store.scss';

interface ISidebarStoreProps {
  dirtyName?: string;
  selectMultiple?: boolean;
  children?: React.ReactNode;
  onClickSearch?: (stores: string[]) => void;
  disabledSearch?: boolean;
  actionConfirm?: (stores: string[]) => void;
  dataSearchChange?: any;
  expanded?: boolean;
  confirmChange?: boolean;
  hiddenSearch?: boolean;
  hasData?: boolean;
  clearData?: () => void;
  firstSelectStore?: (store: IStoreInfo) => void;
  onChangeCollapseExpand?: (isExpanded: boolean, isDirty?: boolean, stores?: string[]) => void;
}

const SidebarStore = ({
  selectMultiple,
  children,
  onClickSearch,
  disabledSearch,
  actionConfirm,
  dataSearchChange,
  confirmChange,
  hiddenSearch = true,
  hasData,
  clearData,
  expanded,
  firstSelectStore,
  onChangeCollapseExpand,
}: ISidebarStoreProps) => {
  const dispatch = useAppDispatch();
  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);
  const [isExpanded, setIsExpanded] = useState(
    expanded && (stores?.length > 1 || false) && isNullOrEmpty(selectedStores)
  );
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const { addView, removeView } = useContext(KeyboardViewContext);

  // When show store add even tab or enter
  // focusElementKeydownHook({ showStore: isExpanded, addEventIfShowStore: true, ref: sideBarRef });

  // Focus first input search
  useEffect(() => {
    setTimeout(() => {
      focusFirstInput(sideBarRef);
    }, 100);
  }, []);

  /*
   Ignore function key of screen below
  */
  useEffect(() => {
    if (isExpanded) {
      addView('store', sideBarRef.current);
    } else {
      removeView('store');
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (functionKeys.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeydown, true);
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [isExpanded]);

  const handleConfirm = () => {
    if (hasData) {
      setShowModalConfirm(true);
      return;
    }

    const checkedStores = stores.filter((store) => store.selected).map((store) => store.store_code);
    dispatch(setSelectedStore(checkedStores));

    if (isNullOrEmpty(checkedStores)) {
      if (clearData) clearData();
    }

    setIsExpanded(false);
    if (onChangeCollapseExpand) onChangeCollapseExpand(false, false, checkedStores);
    if (actionConfirm) actionConfirm(checkedStores);
  };

  const handleCloseSidebar = (showStore?: boolean) => {
    setIsExpanded(showStore);
    if (onChangeCollapseExpand) onChangeCollapseExpand(showStore, false, selectedStores);
    if (!showStore) {
      dispatch(resetSelectedStore());
    }
  };

  const handleClearData = () => {
    const checkedStores = stores.filter((store) => store.selected).map((store) => store.store_code);
    dispatch(setSelectedStore(checkedStores));
    setIsExpanded(false);
    if (onChangeCollapseExpand) onChangeCollapseExpand(false, true);
    setShowModalConfirm(false);
    if (clearData) clearData();
    if (actionConfirm) actionConfirm(checkedStores);
  };

  const handleF12Search = (storesSearch: string[]) => {
    if (isExpanded) return;
    onClickSearch?.(storesSearch);
  };

  return (
    <>
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: showModalConfirm,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={handleClearData}
        handleClose={() => setShowModalConfirm(false)}
      />
      {isExpanded && <div className="sidebar-store-background" onClick={() => handleCloseSidebar(false)} />}
      <div className={`sidebar-store-menu ${isExpanded ? 'sidebar-store-menu__expanded' : ''}`} ref={sideBarRef}>
        <SidebarStoreDefault
          onClickSearch={handleF12Search}
          hiddenSearch={hiddenSearch}
          selectMultiple={selectMultiple}
          disabledSearch={disabledSearch || isExpanded}
          selectTabSearch={actionConfirm}
          dataSearchChange={dataSearchChange}
          clearData={clearData}
          confirmChange={confirmChange}
          sidebarOpen={isExpanded}
          onClickConfirm={handleConfirm}
          firstSelectStore={firstSelectStore}
        >
          {children}
        </SidebarStoreDefault>
        {stores?.length > 1 && (
          <ButtonPrimary
            onClick={() => handleCloseSidebar(!isExpanded)}
            className="sidebar-store-menu__expand-button"
            icon={
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 256 256"
                enableBackground="new 0 0 256 256"
                xmlSpace="preserve"
              >
                <g>
                  <g>
                    <g>
                      <path
                        fill="#000000"
                        d="M70.4,11.2c-3.8,1.7-7.7,6.4-8.4,10.2c-1.5,8.3-3.2,6.3,48.8,58.3l48.1,48.2L110.8,176c-52.1,52.3-50.3,50.1-48.7,58.5c0.8,4.5,6.4,10,10.9,10.9c8.6,1.7,5.6,4.1,65.4-55.6c48.6-48.7,55.1-55.4,55.6-58.5c1.6-8.6,4-5.7-54.7-64.6c-31.1-31.2-55.4-54.8-57.1-55.5C78.5,9.6,74,9.6,70.4,11.2z"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            }
          />
        )}
      </div>
    </>
  );
};

export default SidebarStore;

export const SidebarStoreControl = (props: ISidebarStoreProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => <SidebarStore {...props} hasData={field.value} />}
      control={control}
      name={props.dirtyName}
    />
  );
};
