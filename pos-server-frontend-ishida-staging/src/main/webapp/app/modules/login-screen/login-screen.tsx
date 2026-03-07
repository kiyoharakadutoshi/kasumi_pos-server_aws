import React, { useContext, useEffect, useRef, useState } from 'react';
import './login-screen.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  clearCompany,
  clearSession,
  setAuthentication,
  setMessageError,
  setSelectedCompany,
} from 'app/reducers/user-login-reducer';
import { isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';
import { getIp, getListCompany, getListPermission, login } from 'app/services/login-service';
import { getListStore } from 'app/services/store-service';
import { setPage } from 'app/reducers/menu-reducer';
import { CODE_MASTER, GROUP_STORE_MASTER_CODE, INAGEYA_CODE, KASUMI_CODE, LOGIN_KEY } from 'app/constants/constants';
import Dropdown, { IDropDownItem } from 'app/components/dropdown/dropdown';
import {
  InageyaLeftIcon,
  InageyaRightIcon,
  KasumiLeftIcon,
  KasumiRightIcon,
} from 'app/modules/login-screen/login-icon';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { getMasters } from 'app/services/master-service';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { LIST_COMPANY } from 'app/constants/company-constants';
import { useNavigate } from 'react-router';
import IpRegisterModal from '@/modules/login-screen/ip-register-modal';

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

type companyItem = {
  company_code: number;
  company_name: string;
};

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { removeView } = useContext(KeyboardViewContext);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const isAuthenticated = useAppSelector((state) => state.loginReducer.isAuthenticated);
  const errorMessage = useAppSelector((state) => state.loginReducer.errorMessage);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [currentCompany, setCurrentCompany] = useState(null);
  const [listCompany, setListCompany] = useState([]);
  const [listOptionCompany, setListOptionCompany] = useState<any>([]);
  const [listLogo, setListLogo] = useState([]);
  const [company, setCompany] = useState(LOGO_COMPANIES[0]);
  const [isModalGuide, setIsModalGuide] = useState(false);

  // map data list company to show image on background
  const mapLogo = (arr1: any[], arr2: any[]) => {
    return arr1?.map((item) => {
      const match = arr2?.find((a2) => a2.code === item?.company_code);
      if (match) {
        return match;
      } else {
        return {
          ...LOGO_COMPANIES[0],
          code: item?.company_code,
        };
      }
    });
  };

  // map data list company with data default
  const mapDataArray = (arr1: any[], arr2: any[]) => {
    return arr1?.map((item) => {
      const match = arr2?.find((a2) => a2.code === item?.company_code);
      if (match) {
        return {
          ...match,
          value: item?.company_code,
          code: item?.company_code,
          name: item?.company_name,
        };
      } else {
        return {
          ...LIST_COMPANY[0],
          value: item?.company_code,
          code: item?.company_code,
          name: item?.company_name,
        };
      }
    });
  };

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
  }, [company, username, password]);

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

    if (isNullOrEmpty(username)) {
      setUsernameError(localizeFormat('MSG_VAL_001', 'loginScreen.userId'));
      usernameInputRef?.current?.focus();
      const input = document.querySelector(`input[datatype="user-input"]`);
      setTimeout(() => {
        (input as HTMLInputElement)?.focus();
      }, 400);
      return;
    }

    if (isEmpty) {
      const input = document.querySelector(`input[datatype="password-input"]`);
      setTimeout(() => {
        (input as HTMLInputElement)?.focus();
      }, 400);
      return;
    }

    const bodyParam: Readonly<{
      company_code: number;
      user_name: string;
      password: string;
    }> = {
      company_code: company?.code,
      user_name: username,
      password,
    };
    dispatch(login(bodyParam))
      .unwrap()
      .then((response) => {
        if (response.data) {
          dispatch(setSelectedCompany(company?.code));
          fetchDataStore();

          localStorage.setItem('companyCode', JSON.stringify(company?.code));
        } else {
          dispatch(clearCompany());
        }
      })
      .catch(() => dispatch(clearCompany()));
  };

  const fetchDataStore = () => {
    const runMultipleTasks = async () => {
      await Promise.all([
        dispatch(getListStore()),
        dispatch(getListPermission()),
        dispatch(getMasters({ master_code: [CODE_MASTER.STORE_CODE] })),
      ]);
    };
    runMultipleTasks()
      .then(() => {
        dispatch(setAuthentication(true));
        dispatch(setPage(1));
        navigate('/', { replace: true, state: LOGIN_KEY });
      })
      .catch(() => {
        dispatch(clearSession());
      });
  };

  const handleDropdownChangeStoreCode = (item: IDropDownItem) => {
    setCompany(listLogo.find((data) => data.code === item.code));
    setUsername('');
    setPassword('');
    setUsernameError(null);
    setPasswordError(null);
    setMessageError(null);
  };

  // check ip of user in whitelist to close modal
  const handleCloseModalGuide = () => {
    if (currentCompany) {
      setIsModalGuide(false);
    } else {
      location.reload();
    }
  };

  // if ip of user in whitelist
  // get list company and filter data
  const handleGetListCompany = (data: { company_code: number }) => {
    dispatch(getListCompany(null))
      .unwrap()
      .then((response) => {
        const list = response.data.data.items;
        const findCompany = list?.find((companyItem: companyItem) => companyItem.company_code === data.company_code);
        setCurrentCompany(data?.company_code);
        setListCompany([findCompany]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // get ip whitelist
  useEffect(() => {
    handleGetListCompany({company_code: KASUMI_CODE});
  }, []);

  // map data company to show option in dropdown and image background
  useEffect(() => {
    if (currentCompany && listCompany.length > 0) {
      const logo = mapLogo(listCompany, LOGO_COMPANIES);
      const filteredCompanyData = mapDataArray(listCompany, LIST_COMPANY);
      const checkExist = logo.find((item) => item.code === currentCompany);

      setCompany(checkExist ?? logo[0]);
      setListLogo(logo);
      setListOptionCompany(filteredCompanyData);
    }
  }, [currentCompany, listCompany]);

  return (
    <div className="page-login">
      {isModalGuide && <IpRegisterModal onClose={handleCloseModalGuide} />}
      <div className="page-login__login-wrapper">
        <label className="page-login__title">
          {localizeString('loginScreen.posServer')} {VERSION ?? ''}
        </label>
        {currentCompany && company?.leftIcon}
        <div className="page-login__content">
          <div className="page-login__list">
            <div className={'item-login page-login__list-item'}>
              <label className="page-login__error-login">{localizeString(errorMessage)}</label>
              <Dropdown
                hasBorder={false}
                label="loginScreen.companyCode"
                value={company?.code}
                items={listOptionCompany}
                onChange={handleDropdownChangeStoreCode}
              />

              <InputTextCustom
                labelText={'ユーザーID'}
                placeholder={'loginScreen.userIdPlaceHolder'}
                value={username}
                onChange={(e: any) => {
                  setUsernameError('');
                  dispatch(setMessageError(null));
                  setUsername(e.target.value);
                }}
                isError={!isNullOrEmpty(usernameError)}
                errorText={usernameError}
                inputRef={usernameInputRef}
                datatype="user-input"
              />
              <InputTextCustom
                labelText={'パスワード'}
                placeholder={'loginScreen.passwordPlaceHolder'}
                type={'password'}
                inputRef={passwordInputRef}
                value={password}
                onChange={(e: any) => {
                  setPasswordError('');
                  dispatch(setMessageError(null));
                  setPassword(e.target.value);
                }}
                errorText={passwordError}
                isError={!isNullOrEmpty(passwordError)}
                datatype="password-input"
              />
            </div>
          </div>
          <div className="button-normal">
            <ButtonPrimary
              text={'loginScreen.login'}
              onClick={handleClickLogin}
              widthBtn={'270px'}
              heightBtn={'51px'}
            />
          </div>
        </div>
        {currentCompany && company?.rightIcon}
      </div>
    </div>
  );
};

export default LoginScreen;
