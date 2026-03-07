import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import getStore from 'app/config/store';
import { registerLocale } from 'app/config/translation';
import setupAxiosInterceptors from 'app/config/axios-interceptor';
import ErrorBoundary from 'app/components/error/error-boundary';
import AppComponent from 'app/app';
import { loadIcons } from 'app/config/icon-loader';
import { setupSession } from 'app/reducers/user-login-reducer';
import { setupStore } from './reducers/store-reducer';

const store = getStore();
registerLocale(store);

setupAxiosInterceptors();
store.dispatch(setupSession());
store.dispatch(setupStore());

loadIcons();

const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

const render = (Component) =>
  root.render(
    <ErrorBoundary>
      <Provider store={store}>
        <div>
          <Component />
        </div>
      </Provider>
    </ErrorBoundary>
  );

render(AppComponent);
