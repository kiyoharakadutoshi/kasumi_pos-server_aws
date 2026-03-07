import React, { useContext, useEffect, useRef, useState } from 'react';
import './login-screen.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { clearSession, setAuthentication, clearCompany, setSelectedCompany, setMessageError } from 'app/reducers/user-login-reducer';
import { Navigate, useLocation } from 'react-router-dom';
import { isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';
import { login } from 'app/services/login-service';
import { getListStore } from 'app/services/store-service';
import { setPage } from 'app/reducers/menu-reducer';
import { GROUP_STORE_MASTER_CODE, INAGEYA_CODE, KASUMI_CODE, LIST_COMPANY } from 'app/constants/constants';
import Dropdown, { IDropDownItem } from 'app/components/dropdown/dropdown';
import { InageyaLeftIcon, InageyaRightIcon, KasumiLeftIcon, KasumiRightIcon } from 'app/modules/login-screen/login-icon';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { getMasters } from 'app/services/master-service';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';

const LOGO_COMPANIES = [
  {
    code: KASUMI_CODE,
    leftIcon: <KasumiLeftIcon />,
    rightIcon: <KasumiRightIcon />,
  },
  {
    code: INAGEYA_CODE,
    leftIcon: <InageyaLeftIcon />,
    rightIcon: <InageyaRightIcon />,
  },
];

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const isAuthenticated = useAppSelector(state => state.loginReducer.isAuthenticated);
  const errorMessage = useAppSelector(state => state.loginReducer.errorMessage);
  const [company, setCompany] = useState(LOGO_COMPANIES[0]);
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userNameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { removeView } = useContext(KeyboardViewContext);

  /**
   * Remove view has elements focus when display login screen
   */
  useEffect(() => {
    removeView('store');
    removeView('dialog');
    removeView('modal');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) dispatch(clearCompany());
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        handleClickLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [company, userName, password]);

  useEffect(() => {
    if (!isNullOrEmpty(errorMessage)) {
      usernameInputRef?.current?.focus();
      setPassword('');
    }
  }, [errorMessage]);

  const handleClickLogin = () => {
    dispatch(setMessageError(null));
    let isEmpty = false;
    if (isNullOrEmpty(password)) {
      setPasswordError(localizeFormat('MSG_VAL_001', 'loginScreen.password'));
      isEmpty = true;
    }

    if (isNullOrEmpty(userName)) {
      setUsernameError(localizeFormat('MSG_VAL_001', 'loginScreen.userId'));
      usernameInputRef?.current?.focus();
      const input = document.querySelector(`input[datatype="user-input"]`)
      setTimeout(() => {
        (input as HTMLInputElement)?.focus();
      }, 400);
      return;
    }

    if (isEmpty) {
      const input = document.querySelector(`input[datatype="password-input"]`)
      setTimeout(() => {
        (input as HTMLInputElement)?.focus();
      }, 400);
      return;
    }

    const bodyParam: Readonly<{
      company_code: string;
      user_name: string;
      password: string;
    }> = {
      company_code: company?.code,
      user_name: userName,
      password,
    };
    dispatch(login(bodyParam))
      .unwrap()
      .then(response => {
        if (response.data) {
          fetchDataStore();
        }
      })
      .catch(() => {});
  };

  const fetchDataStore = () => {
    const runMultipleTasks = async () => {
      await Promise.all([dispatch(getListStore()), dispatch(getMasters({ master_code: [GROUP_STORE_MASTER_CODE] }))]);
    };
    runMultipleTasks()
      .then(() => {
        dispatch(setAuthentication(true));
        dispatch(setPage(1));
        dispatch(setSelectedCompany(company?.code));
      })
      .catch(() => {
        dispatch(clearSession());
      });
  };

  const handleDropdownChangeStoreCode = (item: IDropDownItem) => {
    setCompany(LOGO_COMPANIES.find(data => data.code === item.code));
    setUsername('');
    setPassword('');
    setUsernameError(null);
    setPasswordError(null);
    setMessageError(null);
  };

  const { from } = pageLocation.state || { from: { pathname: '/', search: pageLocation.search } };
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  return (
    <div className="page-login">
      <div className="page-login__login-wrapper">
        <label className="page-login__title">{localizeString('loginScreen.posServer')} {VERSION ?? ''}</label>
        {company?.leftIcon}
        <div className="page-login__content">
          <div className="page-login__list">
            <div className={'item-login page-login__list-item'}>
              <label className="page-login__error-login">{localizeString(errorMessage)}</label>
              <Dropdown
                hasBorder={false}
                label="loginScreen.companyCode"
                value={company?.code}
                items={LIST_COMPANY}
                onChange={handleDropdownChangeStoreCode}
              />

              <InputTextCustom
                labelText={'ユーザーID'}
                placeholder={'loginScreen.userIdPlaceHolder'}
                value={userName}
                onChange={(e: any) => {
                  setUsernameError('');
                  dispatch(setMessageError(null));
                  setUsername(e.target.value);
                }}
                isError={!isNullOrEmpty(userNameError)}
                errorText={userNameError}
                inputRef={usernameInputRef}
                datatype="user-input"
              />
              <InputTextCustom
                labelText={'パスワード'}
                placeholder={'loginScreen.passwordPlaceHolder'}
                type={"password"}
                inputRef={passwordInputRef}
                value={password}
                onChange={(e: any) => {
                  setPasswordError('');
                  dispatch(setMessageError(null));
                  setPassword(e.target.value);
                }}
                errorText={passwordError}
                isError={!isNullOrEmpty(passwordError)}
                datatype='password-input'
              />
            </div>
          </div>
          <div className="button-normal">
            <ButtonPrimary text={'loginScreen.login'} onClick={handleClickLogin} widthBtn={'270px'} heightBtn={'51px'} />
          </div>
        </div>
        {company?.rightIcon}
      </div>
    </div>
  );
};

export default LoginScreen;
