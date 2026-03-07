import React, { useEffect, useState } from 'react';
import './menu-screen.scss';
import { useNavigate } from 'react-router-dom';
import { MenuButton } from 'app/components/button/shadow-button/shadow-button';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { isNullOrEmpty, parseString } from 'app/helpers/utils';
import { toNumber } from 'lodash';
import { navigateScreen } from './navigate-screen';
import { setPage } from 'app/reducers/menu-reducer';
import { clearSelectedStores, IStoreInfo } from 'app/reducers/store-reducer';
import { Permission } from 'app/reducers/user-login-reducer';
import Header from 'app/components/header/header';
import BottomButton from 'app/components/bottom-button/bottom-button';
import { clearDataSearch, clearMenuPreset } from '../touch-menu/menu-preset/reducer/menu-preset-reducer';
import { elementChangeKeyListener } from 'app/hooks/keyboard-hook';
import { clearDataMixMatchsSpecialPrice } from 'app/reducers/product-management-reducer';
import { clearDataProduct } from 'app/reducers/product-reducer';
import { clearQuickReport } from 'app/reducers/cash-register-report-reducer';
import { clearFormDataRevenue } from 'app/reducers/product-revenue-pos-reducer';
import { handleUpdateOpenBusinessDay } from '@/reducers/register-settlement-reducer';

const ITEM_PAGE = 20;

const MenuScreen = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentLocale = useAppSelector((state) => state.locale.currentLocale);
  const permissions: Permission[] = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.permissions);
  const pageCodeLast = Math.floor(toNumber(permissions[permissions.length - 1]?.code));
  const maxPage = isNullOrEmpty(permissions)
    ? 0
    : (() => {
        return pageCodeLast % ITEM_PAGE === 0 ? pageCodeLast / ITEM_PAGE : Math.floor(pageCodeLast / ITEM_PAGE) + 1;
      })();

  const [items, setItems] = useState<Permission[]>([]);
  const page = useAppSelector((state) => state.menuReducer.page);
  const [err, setErr] = useState(false);

  // Get html element to handle focus tab, enter when data changes causing UI to change accordingly
  elementChangeKeyListener(items);

  useEffect(() => {
    calculateItems(page);
  }, []);

  useEffect(() => {
    dispatch(clearSelectedStores());
    // clear data sc15
    dispatch(clearMenuPreset());
    dispatch(clearDataSearch());
    dispatch(clearDataMixMatchsSpecialPrice());
    dispatch(clearDataProduct());
    dispatch(clearQuickReport());
    dispatch(clearFormDataRevenue());
    // Clear  open business SC20
    dispatch(handleUpdateOpenBusinessDay(null));
  }, []);

  const handleClickPage = (next: boolean) => {
    const nextPage = next ? page + 1 : page - 1;
    if (nextPage < 1 || nextPage > maxPage) {
      return;
    }
    dispatch(setPage(nextPage));
    calculateItems(nextPage);
    setErr(false);
  };

  const calculateItems = (pageNumber: number) => {
    const currentPermissions = Array.from({ length: ITEM_PAGE }, (_, index) => {
      const code = parseString(index + 1 + (pageNumber - 1) * ITEM_PAGE);
      const permission = permissions?.find((item) => item.code === code);
      return { ...permission, code };
    });
    setItems(currentPermissions);
  };

  const handleNavigate = (code: string) => {
    const codesNavigate = items?.map((item) => Number(item.code));
    if (!code) {
      setErr(false);
      return;
    }
    if (
      navigateScreen[code] === code ||
      !navigateScreen[code] ||
      pageCodeLast < Number(code) ||
      !codesNavigate.includes(Number(code))
    ) {
      setErr(true);
      return;
    }

    navigate(`/${navigateScreen[code]}`);
    dispatch(clearSelectedStores());
  };

  // Block F7 press event
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F7') {
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <div className="menu-screen">
      <Header
        isDisable
        printer={{ disabled: true }}
        csv={{
          listTitleTable: [],
          disabled: true,
          csvData: [],
          fileName: '',
        }}
        title="menuScreen.title"
        hasLogout={true}
      />
      <div className="menu-screen__menu-screen-container">
        <div className="menu-screen__content">
          <div className="menu-screen__content-inner">
            <div className={'menu-screen__list-button'}>
              <div className="row-button">
                {items.slice(0, 10)?.map((item, index) => {
                  return (
                    <div className={'menu-screen__item-button'} key={index}>
                      <MenuButton
                        code={item?.code}
                        name={item?.name ? item?.name[currentLocale] ?? '' : ''}
                        onClick={() => handleNavigate(item?.code)}
                        disabled={isNullOrEmpty(item?.alias_name)}
                        classBtn="menu-screen__btn"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="row-button">
                {items.slice(10)?.map((item, index) => {
                  return (
                    <div className={'menu-screen__item-button'} key={index}>
                      <MenuButton
                        width="800px"
                        code={item?.code}
                        name={item?.name ? item?.name[currentLocale] ?? '' : ''}
                        onClick={() => handleNavigate(item?.code)}
                        disabled={isNullOrEmpty(item?.alias_name)}
                        classBtn="menu-screen__btn"
                        height="60px"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <BottomButton
          hasPagging={true}
          hasSearchPage={true}
          handlePrePage={() => handleClickPage(false)}
          handleNextPage={() => handleClickPage(true)}
          page={page}
          maxPage={maxPage}
          onClickPage={(pageNumber: number) => {
            dispatch(setPage(pageNumber));
            calculateItems(pageNumber);
          }}
          handleNavigate={handleNavigate}
          canKeyDown={true}
          errNotification={err}
        />
      </div>
    </div>
  );
};

export default MenuScreen;
