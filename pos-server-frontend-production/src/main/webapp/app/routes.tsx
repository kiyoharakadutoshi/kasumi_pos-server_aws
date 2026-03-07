import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/components/error/error-boundary-routes';
import PageNotFound from 'app/components/error/page-not-found';
import EmployeeSetting from 'app/modules/employee-setting/employee-setting';
import TouchMenu from 'app/modules/touch-menu/menu-preset/menu-preset';
import MainPreset from './modules/touch-menu/detail/main-preset';
import MasterTicket from './modules/master-ticket/master-ticket';
import SettingMaster from 'app/modules/setting-master/setting-master';
import LoginScreen from 'app/modules/login-screen/login-screen';
import MenuScreen from 'app/modules/menu-screen/menu-screen';
import { useAppSelector } from './config/store';
import PrivateRoute from './components/auth/private-route';
import PaymentMachines from 'app/modules/setting-master/add-cash-register-type/add-cash-register-type';
import SearchJournal from 'app/modules/search-journal/search-journal';
import ViewRouteAction from 'app/components/view-route-action/view-route-action';
import PriceChange from 'app/modules/price-change/price-change';
import CashReport from '@/modules/cash-report/cash-report';

const SpecialPromotion = lazy(() => import('@/modules/special-promotion/special-promotion'));
import PageCommon from './modules/page-common';
import MixMatchSettings from '@/modules/mix-match-settings/';
import MasterStores from './modules/master-stores/master-stores';

const ChangingPrice = lazy(() => import('@/modules/sc0103-changing-price'));
import StandardChange from '@/modules/standard-change/standard-change';

const ProductManagement = lazy(() => import('@/modules/product-management/product-management'));
import PromotionMaintenance from './modules/promotion-maintenance/promotion-maintenance';
import MasterCategory from './modules/master-category/master-category';
import { URL_MAPPING } from 'app/router/url-mapping';
import RegisterSettlement from '@/modules/register-settlement/register-settlement';

import SpecialPromotionEdit from 'app/modules/product-management/special-promotion';
import RegisterSettlementDetail from '@/modules/register-settlement/register-detail/register-settlement-detail';

import ProductReport from './modules/sc12-product-report';
import CheckTimeCashRegister from './modules/check-time-cash-register/check-time-cash-register';
import SalesReport from './modules/sales-report/sales-report';
import Sc3102DetailReport from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report';

const ProductDetailSetting = lazy(() => import('@/modules/sc0102-product-detail-setting'));
const RevenueCheckByProductAndPOS = lazy(() => import('@/modules/sc3201-product-revenue-pos'));
const CheckingSalesItem = lazy(() => import('@/modules/sc3202-checking-sales-items'));
const PriceChangeExplanations = lazy(() => import('@/modules/sc19-price-change-explanations'));
const ReceiptCouponSetting = lazy(() => import('@/modules/sc2801-receipt-coupon-setting'));
import UserSetting from './modules/user-setting/user-setting';
import ChangePassword from './modules/change-password/change-password';
import MasterRedistribution from '@/modules/master-redistribution/master-redistribution';
import Sc3101ListCashRegisterReport from 'app/modules/sc31-report-quick-cashier/sc3101-list-cash-register-report/sc3101-list-cash-register-report';
import ImageUpload from './modules/management-image/image-upload';
import BudgetRegistration from './modules/budget-registration/budget-registration';
import { Permission } from 'app/reducers/user-login-reducer';
import { accessScreens } from 'app/helpers/utils';
import NewProduct from 'app/modules/sc4501-add-product';
import CashRegisterStatusReference from 'app/modules/sc7301-cash-register-status-reference/sc7301-cash-register-status';
import BatchControl from './modules/batch-control/batch-control';
import MegaDiscountSettings from './modules/sc3701-mega-discount-settings';
import MorningDiscountSettings from './modules/sc3801-morning-discount-settings';
import SetupAlertPaymentMachine from './modules/sc81-setup-alert-payment-machine';
import SubtotalDiscountSettings from './modules/sc22-subtotal-discount-settings';
import SalesTenantReport from './modules/sc14-sales-tenant-report';
import CategoryDiscountReceiptCouponSettings from './modules/sc9601-category-discount-receipt-coupon-settings';

const AppRoutes = () => {
  const isAuthenticated: boolean = useAppSelector((state) => state.loginReducer.isAuthenticated);
  const permissions: Permission[] = useAppSelector((state) => state.loginReducer)?.userLogin?.user_detail?.permissions;
  const screensAccess = accessScreens(permissions);

  return (
    <ViewRouteAction>
      <ErrorBoundaryRoutes>
        <Route path="login" element={<LoginScreen />} />
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} screensAccess={screensAccess} />}>
          <Route path="*" element={<PageNotFound />} />
          <Route index element={<MenuScreen />} />
          <Route path={URL_MAPPING.SC0101}>
            <Route path="" element={<ProductManagement />} />
            <Route path={URL_MAPPING.SC0102} element={<ProductDetailSetting />} />
            <Route path={URL_MAPPING.SC0103} element={<ChangingPrice />} />
          </Route>
          <Route path={URL_MAPPING.SC4501} element={<NewProduct />} />
          <Route path="touch-menu">
            <Route path="" element={<TouchMenu />} />
            <Route path="detail" element={<MainPreset />} />
          </Route>
          <Route path="master-ticket" element={<MasterTicket />} />
          <Route path="employee-setting" element={<EmployeeSetting />} />
          <Route path="search-journal" element={<SearchJournal />} />
          <Route path={URL_MAPPING.SC3101}>
            <Route path="" element={<Sc3101ListCashRegisterReport />} />
            <Route path="detail" element={<Sc3102DetailReport />} />
          </Route>
          <Route path={URL_MAPPING.SC7101}>
            <Route path="" element={<SettingMaster />} />
            <Route path={URL_MAPPING.SC7102} element={<PaymentMachines />} />
          </Route>
          <Route path={'price-change'} element={<PriceChange />} />
          <Route path="special-promotion" element={<SpecialPromotion />} />
          <Route path="special-promotion-edit" element={<SpecialPromotionEdit />} />
          <Route path="cash-report" element={<CashReport />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path={URL_MAPPING.SC0501} element={<MixMatchSettings />} />
          <Route path={URL_MAPPING.SC3201}>
            <Route path="" element={<RevenueCheckByProductAndPOS />} />
            <Route path={URL_MAPPING.SC3202} element={<CheckingSalesItem />} />
          </Route>
          <Route path="master-stores" element={<MasterStores />} />
          <Route path={URL_MAPPING.SC0601} element={<StandardChange />} />
          <Route path="master-category" element={<MasterCategory />} />
          <Route path={URL_MAPPING.SC2001} element={<RegisterSettlement />} />
          <Route path={URL_MAPPING.SC2002} element={<RegisterSettlementDetail />} />
          <Route path="user-setting" element={<UserSetting />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path={URL_MAPPING.SC1201} element={<ProductReport />} />
          <Route path="check-time-cash-register" element={<CheckTimeCashRegister />} />
          <Route path="master-redistribution" element={<MasterRedistribution />} />
          <Route path="image-upload" element={<ImageUpload />} />
          <Route path="budget-registration" element={<BudgetRegistration />} />
          <Route path={URL_MAPPING.SC7301} element={<CashRegisterStatusReference />} />
          <Route path="setup-alert-payment-machine" element={<SetupAlertPaymentMachine />} />
          <Route path={URL_MAPPING.SC3701} element={<MegaDiscountSettings />} />
          <Route path={URL_MAPPING.SC3801} element={<MorningDiscountSettings />} />
          <Route path={URL_MAPPING.SC2201} element={<SubtotalDiscountSettings />} />
          <Route path={URL_MAPPING.SC1901} element={<PriceChangeExplanations />} />
          <Route path={URL_MAPPING.SC2801} element={<ReceiptCouponSetting />} />
          <Route path={URL_MAPPING.SC1401} element={<SalesTenantReport />} />
          <Route path={URL_MAPPING.SC9601} element={<CategoryDiscountReceiptCouponSettings />} />
        </Route>
        <Route path="page-common" element={<PageCommon />} />
        <Route path="promotion-maintenance" element={<PromotionMaintenance />} />
        <Route path="batch-control" element={<BatchControl />} />
      </ErrorBoundaryRoutes>
    </ViewRouteAction>
  );
};

export default AppRoutes;
