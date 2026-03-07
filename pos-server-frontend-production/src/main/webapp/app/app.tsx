import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'app/config/dayjs';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppSelector } from 'app/config/store';
import ErrorBoundary from 'app/components/error/error-boundary';
import AppRoutes from 'app/routes';
import ModalLoading from './components/loading/loading';
import { CompanyInfo } from 'app/reducers/user-login-reducer';
import { BLUE_D0DBF3 } from 'app/constants/color';
import KeyboardNavigation from 'app/components/keyboard-navigation/keyboard-navigation';
import { CheckLoginHook } from 'app/hooks/check-login-hook';
import StagingEnvironmentMessage from './components/alert-text';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');
export const BASE_CONTENT_CLASS_NAME = 'base-content';

export const App = () => {
  useAppSelector(state => state.locale.currentLocale);
  const company: CompanyInfo = useAppSelector(state => state.loginReducer.selectedCompany);

  // When opening tab: check first tab => log out
  CheckLoginHook();

  return (
    <BrowserRouter basename={baseHref}>
      <div className="app-container" style={{ backgroundColor: company?.backgroundColor ?? BLUE_D0DBF3 }}>
        <ModalLoading />
        <div className="container-fluid view-container" id="app-view-container">
          {STAGING_ENV && <StagingEnvironmentMessage />}
          <div className={BASE_CONTENT_CLASS_NAME}>
            <ErrorBoundary>
              <KeyboardNavigation>
                <AppRoutes />
              </KeyboardNavigation>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
