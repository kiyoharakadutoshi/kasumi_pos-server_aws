import { NormalIconButton } from 'app/components/button/flat-button/flat-button';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './styles.scss';
import { useAppSelector } from 'app/config/store';
import { IStoreInfo } from 'app/reducers/store-reducer';

import CheckboxButton from 'app/components/checkbox-button/checkbox-button';

import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { localizeString } from '@/helpers/utils';

enum SideBarTabType {
  Store,
  Search,
}

interface SideBarTab {
  name: string;
  type: SideBarTabType;
}

const MegaDiscountStore = ({
  selectMultiple,
  children,
  expanded,
  clearData,
  hiddenSearch,
  sidebarOpen,
  selectedExcludedStores,
  id
}: {
  selectMultiple?: boolean;
  children?: React.ReactNode;
  onClickSearch: (stores: string[]) => void;
  disabledSearch?: boolean;
  selectTabSearch?: (stores: string[]) => void;
  dataSearchChange?: any;
  clearData?: boolean;
  btnSearchHeight?: string;
  inputSearchHeight?: string;
  expanded?: boolean;
  confirmChange?: boolean;
  hiddenSearch?: boolean;
  sidebarOpen?: boolean;
  firstSelectStore?: (store: IStoreInfo) => void;
  onClickConfirm?: () => void;
  selectedExcludedStores?: (stores: IStoreInfo[]) => void;
  id?: string;
}) => {
  const [tabs, setTabs] = useState<SideBarTab[]>([
    {
      name: 'excludedStores',
      type: SideBarTabType.Store,
    },
  ]);
  const [indexTab, setIndexTab] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [groupStoreValue, setGroupStoreValue] = useState<string | null>();
  const storeRefs = useRef<React.RefObject<HTMLLIElement>[]>([]);

  useEffect(() => {
    if (children) {
      setTabs((prevState) => [...prevState, { name: 'sidebar.search', type: SideBarTabType.Search }]);
    }
  }, []);

  function handleSelectedStores(stores: IStoreInfo[]): void {
    selectedExcludedStores(stores);
  }

  return (
    <div className="exclude-store">
      <div className={`exclude-store__container ${expanded ? 'exclude-store__expanded' : ''}`}>
        <div className={`exclude-store__tab-menu`} style={{ gridTemplateColumns: '1fr' }}>
          {tabs.map((tab, index) => (
            <div key={index} className="exclude-store__tab-item-container">
              <div className="exclude-store__tab-item">
                <div>{localizeString(tab.name)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="exclude-store__content">
          {(() => {
            switch (tabs[indexTab]?.type) {
              case SideBarTabType.Search:
                return (
                  <div className="exclude-store__search">
                    <div className="exclude-store__search-content">{children}</div>
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
                    sidebarOpen={sidebarOpen}
                    selectedExcludedStores={handleSelectedStores}
                    clearData={clearData}
                    id={id}
                  />
                );
              default:
                return <></>;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export const MenuBarStore = ({
  selectMultiple,
  keyword,
  groupStoreValue,
  refs,
  hiddenSearch,
  sidebarOpen,
  selectedExcludedStores,
  clearData,
  id
}: {
  selectMultiple?: boolean;
  keyword?: string;
  setKeyword?: React.Dispatch<React.SetStateAction<string>>;
  groupStoreValue?: string;
  setGroupStoreValue?: React.Dispatch<React.SetStateAction<string>>;
  refs?: React.MutableRefObject<React.RefObject<HTMLLIElement>[]>;
  numberSelectedStore?: number;
  hiddenSearch?: boolean;
  sidebarOpen?: boolean;
  selectedExcludedStores?: (stores: IStoreInfo[]) => void;
  clearData?: boolean;
  id?: string;
}) => {
  const { topView } = useContext(KeyboardViewContext);
  const storesDefault: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const [stores, setStores] = useState<IStoreInfo[]>(
    storesDefault?.map((store) => ({
      ...store,
      selected: false,
    }))
  );

  const scrollToItem = (index: number, animated: boolean = true) => {
    if (refs.current[index] && refs.current[index].current) {
      if (animated) {
        refs.current[index].current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        refs.current[index].current?.scrollIntoView();
      }
    }
  };

  const selectedStoresInLeftSidebar = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  useEffect(() => {
    const index = stores.findIndex((store) => store.selected);
    scrollToItem(index, false);
  }, []);

  // Handle change store
  useEffect(() => {
    setStores(
      storesDefault?.map((store) => ({
        ...store,
        selected: false,
      }))
    );
  }, [selectedStoresInLeftSidebar[0], clearData]);

  const filteredStores = () => {
    const keywordSearch = keyword.trim().toLowerCase();
    return stores?.filter(
      (store) =>
        `${store.store_code} : ${store.store_name.toLowerCase()}`.includes(keywordSearch) &&
        (!groupStoreValue || store.business_type_code === groupStoreValue)
    );
  };

  const handleSelectAllStore = (selectAll: boolean) => {
    const newStores = stores?.map((store) => ({ ...store, selected: selectAll }));
    const checkedStores = newStores?.filter((store) => store.selected);
    setStores(newStores);
    selectedExcludedStores(checkedStores);
  };

  const selectCheckbox = (store_code: string) => {
    const newStores = stores?.map((store) =>
      store.store_code === store_code ? { ...store, selected: !store.selected } : store
    );
    const checkedStores = newStores?.filter((store) => store.selected);
    setStores(newStores);
    selectedExcludedStores(checkedStores);
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
    <div className="exclude-store__store">
      <div className="exclude-store__wrapinput-search">
        {selectMultiple && (
          <>
            <div className="exclude-store__button-select-all">
              <NormalIconButton
                onClick={() => handleSelectAllStore(false)}
                text="apply-store.unselectAll"
                className="exclude-store__unselect-all"
                width="100%"
                disabled={stores.every((item) => !item.selected)}
              />
              <NormalIconButton
                onClick={() => handleSelectAllStore(true)}
                text="apply-store.selectAll"
                className="exclude-store__select-all"
                width="100%"
                disabled={stores.every((item) => item.selected)}
              />
            </div>
          </>
        )}
      </div>
      <div className="exclude-store__store-content">
        <ul
          className={`list-unstyled exclude-store__list-store ${
            selectMultiple
              ? 'exclude-store__list-store-checkbox'
              : hiddenSearch
                ? 'exclude-store__list-store-radio-hidden-search'
                : 'exclude-store__list-store-radio'
          }`}
        >
          {filteredStores()?.map((store, index) => {
            return (
              <li key={index} className="exclude-store__list-store-item" ref={refs.current[index]}>
                {selectMultiple ? (
                  <CheckboxButton
                    id={id ?? "" + index + store.store_code}
                    onChange={() => selectCheckbox(store.store_code)}
                    checkBoxValue={store.store_code}
                    checked={store.selected}
                    textValue={`${store.store_code} : ${store.store_name}`}
                    className={'exclude-store_checkbox-button'}
                  />
                ) : (
                  <></>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default MegaDiscountStore;
