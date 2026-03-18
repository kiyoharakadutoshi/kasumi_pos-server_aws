import { ReducersMapObject } from '@reduxjs/toolkit';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';
import applicationProfile from '../modules/home/application-04';
import locale from './locale';
import settingMasterReducer from 'app/reducers/setting-master-reducer';
import presetReducer from 'app/modules/touch-menu/detail/reducer/preset-reducer';
import productReducer from './product-reducer';
import masterReducer from './master-reducer';
import loginReducer from './user-login-reducer';
import hierarchyLevelReducer from './hierarchy-level-reducer';
import menuPresetReducer from 'app/modules/touch-menu/menu-preset/reducer/menu-preset-reducer';
import error from './error';
import storeReducer from './store-reducer';
import loadingReducer from '../components/loading/loading-reducer';
import menuReducer from './menu-reducer';
import paymentMachineReducer from 'app/reducers/payment-machine-reducer';
import cashReportReducer from './cash-report-reducer';
import confirmReducer from 'app/reducers/confirm-reducer';
import specialPromotionReducer from 'app/reducers/special-promotion-reducer';
import promotionReducer from 'app/reducers/promotion-reducer';
import masterStoresReducer from 'app/reducers/master-stores-reducer';
import registerSettlementReducer from '@/reducers/register-settlement-reducer';
import productManagementReducer from 'app/reducers/product-management-reducer';
import cashRegisterReportReducer from 'app/reducers/cash-register-report-reducer';
import productRevenuePosReducer from 'app/reducers/product-revenue-pos-reducer';
import companyReducer from 'app/reducers/company-reducer'

const rootReducer: ReducersMapObject = {
  cashRegisterReportReducer,
  productManagementReducer,
  promotionReducer,
  specialPromotionReducer,
  confirmReducer,
  menuReducer,
  storeReducer,
  loadingReducer,
  error,
  menuPresetReducer,
  hierarchyLevelReducer,
  masterReducer,
  productReducer,
  presetReducer,
  loginReducer,
  paymentMachineReducer,
  settingMasterReducer,
  locale,
  applicationProfile,
  loadingBar,
  cashReportReducer,
  masterStoresReducer,
  registerSettlementReducer,
  productRevenuePosReducer,
  companyReducer
};

export default rootReducer;
