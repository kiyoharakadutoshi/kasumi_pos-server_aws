import { NormalIconButton } from 'app/components/button/flat-button/flat-button';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './sidebar-store-default.scss';
import '../button/button.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { IStoreInfo, selectAllStore, selectSingleStore, setSelectedStore, updateSelectedStore } from 'app/reducers/store-reducer';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';

import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import Dropdown, { IDropDownItem } from 'app/components/dropdown/dropdown';
import CheckboxButton from 'app/components/checkbox-button/checkbox-button';
import { RadioButton } from '../radio-button-component/radio-button';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';

enum SideBarTabType {
  Store,
  Search,
}

interface SideBarTab {
  name: string;
  type: SideBarTabType;
}

export const clickButtonSearch = () => {
  const event = new Event('clickButtonSearch');
  window.dispatchEvent(event);
};

const SidebarStoreDefault = ({
  selectMultiple,
  children,
  onClickSearch,
  disabledSearch,
  selectTabSearch,
  expanded,
  confirmChange,
  hiddenSearch,
  sidebarOpen,
  firstSelectStore,
  onClickConfirm,
}: {
  selectMultiple?: boolean;
  children?: React.ReactNode;
  onClickSearch: (stores: string[]) => void;
  disabledSearch?: boolean;
  selectTabSearch?: (stores: string[]) => void;
  dataSearchChange?: any;
  clearData?: any;
  btnSearchHeight?: string;
  inputSearchHeight?: string;
  expanded?: boolean;
  confirmChange?: boolean;
  hiddenSearch?: boolean;
  sidebarOpen?: boolean;
  firstSelectStore?: (store: IStoreInfo) => void;
  onClickConfirm?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const stores: IStoreInfo[] = useAppSelector(state => state.storeReducer.stores);
  const selectedStores = stores.filter(item => item.selected).map(item => item.store_code);
  const prevSelectedStores = useAppSelector(state => state.storeReducer.selectedStores);
  const [tabs, setTabs] = useState<SideBarTab[]>(
    stores?.length > 1
      ? [
          {
            name: 'sidebar.store',
            type: SideBarTabType.Store,
          },
        ]
      : [],
  );
  const [indexTab, setIndexTab] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [groupStoreValue, setGroupStoreValue] = useState<string | null>();
  const storeRefs = useRef<React.RefObject<HTMLLIElement>[]>([]);
  const [showModalConfirm, setShowModalConfirm] = useState(false);

  elementChangeKeyListener(groupStoreValue);

  useEffect(() => {
    if (storeRefs.current?.length !== stores?.length) {
      storeRefs.current = Array(stores?.length)
        .fill(null)
        .map(() => React.createRef<HTMLLIElement>());
    }

    if (selectMultiple || isNullOrEmpty(stores)) {
      return;
    }

    if (stores.some(store => store.selected)) {
      return;
    }

    const firstStore = stores[0];
    dispatch(selectSingleStore(firstStore?.store_code));
    dispatch(setSelectedStore([firstStore?.store_code]));
    if (firstSelectStore) firstSelectStore(firstStore);
  }, []);

  useEffect(() => {
    if (children) {
      setTabs(prevState => [...prevState, { name: 'sidebar.search', type: SideBarTabType.Search }]);
    }
  }, []);

  useEffect(() => {
    const handleTabCloseOrReload = () => {
      if (confirmChange) {
        setShowModalConfirm(false);
      }
    };
    const handleKeyDown = (event: any) => {
      if (event.key === 'F12' && !disabledSearch) {
        event.preventDefault();
        checkSearch();
      }
    };

    window.addEventListener('beforeunload', handleTabCloseOrReload);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('clickButtonSearch', checkSearch);
    return () => {
      window.removeEventListener('beforeunload', handleTabCloseOrReload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('clickButtonSearch', checkSearch);
    };
  });

  const disabledConfirm = useMemo(() => {
    return isNullOrEmpty(selectedStores) && isNullOrEmpty(prevSelectedStores);
  }, [prevSelectedStores, selectedStores]);

  const checkSearch = () => {
    if (confirmChange) {
      setShowModalConfirm(true);
      return;
    }
    handleSearch();
  };

  const handleSearch = () => {
    setShowModalConfirm(false);
    if (isNullOrEmpty(selectedStores)) return;
    onClickSearch(selectedStores);
  };

  const changeTab = (index: number) => {
    const selectedTabType = tabs[indexTab]?.type;
    if (tabs[index]?.type === SideBarTabType.Search && selectedStores?.length === 0) return;
    if (selectedTabType !== SideBarTabType.Search && tabs[index].type === SideBarTabType.Search && selectTabSearch) {
      selectTabSearch(selectedStores);
    }
    setIndexTab(index);
  };

  const tabItemContainerClassName = (index: number) => {
    let className = 'sidebar-store__tab-item-container';
    if (index === indexTab - 1) {
      className += ' sidebar-store__previous-selected-tab';
    }

    if (tabs[index].type !== SideBarTabType.Search && selectedStores?.length === 0) {
      className += ' sidebar-store__previous-selected-tab-disable';
    }
    return className;
  };

  const tabItemClassName = (index: number) => {
    let className = 'sidebar-store__tab-item';

    if (tabs.length === 1) {
      return className;
    }

    if (stores?.length > 1 && index === indexTab) {
      className += ' sidebar-store__selected-tab-item';
    }

    if (tabs[index].type !== SideBarTabType.Store && selectedStores?.length === 0) {
      className += ' sidebar-store__tab-search-disable';
    }
    return className;
  };

  return (
    <div className="sidebar-store">
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: showModalConfirm,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={handleSearch}
        handleClose={() => setShowModalConfirm(false)}
      />
      <div className={`sidebar-store__container ${expanded ? 'sidebar-store__expanded' : ''}`}>
        <div className={`sidebar-store__tab-menu`} style={{ gridTemplateColumns: tabs.map(_ => '1fr').join(' ') }}>
          {tabs.map((tab, index) => (
            <div key={index} className={tabItemContainerClassName(index)}>
              <div className={tabItemClassName(index)} onClick={() => changeTab(index)}>
                {localizeString(tab.name)}
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-store__content">
          {(() => {
            switch (tabs[indexTab]?.type) {
              case SideBarTabType.Search:
                return (
                  <div className="sidebar-store__search">
                    <div className="sidebar-store__search-content">{children}</div>
                  </div>
                );
              case SideBarTabType.Store:
                return (
                  <MenuBarStore
                    hiddenSearch={hiddenSearch}
                    groupStoreValue={groupStoreValue}
                    setGroupStoreValue={setGroupStoreValue}
                    selectMultiple={selectMultiple}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    refs={storeRefs}
                    numberSelectedStore={selectedStores?.length}
                    sidebarOpen={sidebarOpen}
                  />
                );
              default:
                return <></>;
            }
          })()}
        </div>
        <div className="sidebar-store__bottom-button-dirty-check">
          <ButtonPrimary
            onClick={onClickConfirm}
            text="action.confirm"
            disabled={disabledConfirm}
            className={'sidebar-store__confirm-button'}
          />
        </div>
      </div>
    </div>
  );
};

const MenuBarStore = ({
  selectMultiple,
  keyword,
  setKeyword,
  groupStoreValue,
  setGroupStoreValue,
  refs,
  numberSelectedStore,
  hiddenSearch,
  sidebarOpen,
}: {
  selectMultiple?: boolean;
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  groupStoreValue?: string;
  setGroupStoreValue: React.Dispatch<React.SetStateAction<string>>;
  refs: React.MutableRefObject<React.RefObject<HTMLLIElement>[]>;
  numberSelectedStore: number;
  hiddenSearch?: boolean;
  sidebarOpen?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { topView } = useContext(KeyboardViewContext);
  const stores: IStoreInfo[] = useAppSelector(state => state.storeReducer.stores);
  const groupStores: IDropDownItem[] = useAppSelector(state => state.storeReducer.group_stores);

  const scrollToItem = (index: number, animated: boolean = true) => {
    if (refs.current[index] && refs.current[index].current) {
      if (animated) {
        refs.current[index].current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        refs.current[index].current?.scrollIntoView();
      }
    }
  };

  useEffect(() => {
    const index = stores.findIndex(store => store.selected);
    scrollToItem(index, false);
  }, []);

  const filteredStores = () => {
    const keywordSearch = keyword.trim().toLowerCase();
    return stores.filter(
      store =>
        `${store.store_code}：${store.store_name.toLowerCase()}`.includes(keywordSearch) &&
        (!groupStoreValue || store.business_type_code === groupStoreValue),
    );
  };

  const handleSelectAllStore = (selectAll: boolean) => {
    dispatch(selectAllStore(selectAll));
  };

  const selectCheckbox = (store_code: string) => {
    dispatch(updateSelectedStore(store_code));
  };

  const selectRadio = (storeCode: string) => {
    dispatch(selectSingleStore(storeCode));
  };

  useEffect(() => {
    const handleSelectStore = (event: any) => {
      if (event.key === 'F2' && sidebarOpen) {
        event.preventDefault();
        handleSelectAllStore(true);
      } else if (event.key === 'F1' && sidebarOpen) {
        event.preventDefault();
        handleSelectAllStore(false);
      }
    };

    if (topView?.type === 'store') {
      window.addEventListener('keydown', handleSelectStore, true);
    }
    return () => window.removeEventListener('keydown', handleSelectStore, true);
  }, [topView]);

  return (
    <div className="sidebar-store__store">
      <div className="sidebar-store__wrapinput-search">
        {selectMultiple && (
          <label className="sidebar-store__result">
            {numberSelectedStore} {localizeString('sidebar.result')}
          </label>
        )}
        <InputTextCustom
          value={keyword}
          icon={
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.3568 22.3749L12.7041 14.7624C12.0967 15.2458 11.3982 15.6284 10.6087 15.9104C9.81909 16.1923 8.9789 16.3333 8.08811 16.3333C5.88135 16.3333 4.01371 15.573 2.48518 14.0525C0.956648 12.5321 0.192383 10.6742 0.192383 8.47911C0.192383 6.28397 0.956648 4.42615 2.48518 2.90567C4.01371 1.38518 5.88135 0.624939 8.08811 0.624939C10.2949 0.624939 12.1625 1.38518 13.691 2.90567C15.2196 4.42615 15.9838 6.28397 15.9838 8.47911C15.9838 9.36522 15.8421 10.201 15.5587 10.9864C15.2752 11.7718 14.8906 12.4666 14.4047 13.0708L22.0575 20.6833L20.3568 22.3749ZM8.08811 13.9166C9.60651 13.9166 10.8972 13.388 11.96 12.3307C13.0229 11.2734 13.5544 9.98952 13.5544 8.47911C13.5544 6.96869 13.0229 5.68483 11.96 4.62754C10.8972 3.57025 9.60651 3.04161 8.08811 3.04161C6.5697 3.04161 5.27905 3.57025 4.21616 4.62754C3.15328 5.68483 2.62184 6.96869 2.62184 8.47911C2.62184 9.98952 3.15328 11.2734 4.21616 12.3307C5.27905 13.388 6.5697 13.9166 8.08811 13.9166Z"
                fill="#545F95"
              />
            </svg>
          }
          placeholder={'店番または店名で検索'}
          onChange={(e: any) => setKeyword(e.target.value)}
          inputClassName={'sidebar-store__input_search'}
        />
        {selectMultiple && (
          <>
            <Dropdown
              className={'sidebar-store_dropdown'}
              buttonClassName={'sidebar-store_dropdown-button'}
              items={groupStores ?? []}
              hasBlankItem={true}
              value={groupStoreValue}
              onChange={item => setGroupStoreValue(item.value?.toString())}
            />
            <div className="sidebar-store__button-select-all">
              <NormalIconButton
                onClick={() => handleSelectAllStore(false)}
                text="apply-store.unselectAll"
                className="sidebar-store__unselect-all"
                width="100%"
                disabled={stores.every(item => !item.selected)}
              />
              <NormalIconButton
                onClick={() => handleSelectAllStore(true)}
                text="apply-store.selectAll"
                className="sidebar-store__select-all"
                width="100%"
                disabled={stores.every(item => item.selected)}
              />
            </div>
          </>
        )}
      </div>
      <div className="sidebar-store__store-content">
        <ul
          className={`list-unstyled sidebar-store__list-store ${
            selectMultiple
              ? 'sidebar-store__list-store-checkbox'
              : hiddenSearch
                ? 'sidebar-store__list-store-radio-hidden-search'
                : 'sidebar-store__list-store-radio'
          }`}
        >
          {filteredStores()?.map((store, index) => {
            return (
              <li key={index} className="sidebar-store__list-store-item" ref={refs.current[index]}>
                {selectMultiple ? (
                  <CheckboxButton
                    id={index + store.store_code}
                    onChange={() => selectCheckbox(store.store_code)}
                    checkBoxValue={store.store_code}
                    checked={store.selected}
                    textValue={`${store.store_code}：${store.store_name}`}
                    className={'sidebar-store_checkbox-button'}
                  />
                ) : (
                  <RadioButton
                    id={index + store.store_code}
                    onChange={() => selectRadio(store.store_code)}
                    textValue={`${store.store_code}：${store.store_name}`}
                    checked={store.selected}
                    className={'sidebar-store__radio-button'}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default SidebarStoreDefault;
