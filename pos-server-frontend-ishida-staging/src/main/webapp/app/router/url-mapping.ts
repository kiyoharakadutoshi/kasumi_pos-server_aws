import { Permission } from 'app/reducers/user-login-reducer';

export enum URL_MAPPING {
  // MENU PAGE
  SLASH_PATH = '/',
  // LOGIN
  LOGIN_PATH = 'login',
  // PAGE COMMON
  PAGE_COMMON_PATH = 'page-common',
  // BATCH CONTROL
  BATCH_CONTROL_PATH = 'batch-control',
  DETAIL = 'detail',
  // SC01
  SC0101 = 'product-management',
  SC0102 = 'product-detail',
  SC0103 = 'changing-price',
  // SC02
  SC0201 = 'price-change',
  // SC03
  SC0301 = 'special-promotion',
  // SC04
  SC0401 = 'ishida-price-change',
  // SC05
  SC0501 = 'mix-match',
  // SC06
  SC0601 = 'standard-price',
  // SC08
  SC0801 = 'master-category',
  // SC10
  SC1001 = 'promotion-maintenance',
  // SC11
  SC1101 = 'sales-report',
  // SC12
  SC1201 = 'product-report',
  // SC14
  SC1401 = 'sales-tenant-report',
  // SC15
  SC1501 = 'preset-setting',
  // SC19
  SC1901 = 'price-change-explanations',
  // SC20
  SC2001 = 'register-settlement',
  // SC21
  SC2101 = 'search-journal',
  // SC22
  SC2201 = 'subtotal-discount-settings',
  // SC23
  SC2301 = 'point-unit-usage-setting',
  // SC28
  SC2801 = 'receipt-coupon-setting',
  // SC29
  SC2901 = 'check-time-instores',
  // SC31
  SC3101 = 'instores-report',
  // SC32
  SC3201 = 'product-revenue-pos',
  SC3202 = 'checking-sales-item',
  // SC33
  SC3301 = 'cash-report',
  // SC34
  SC3401 = 'import-export',
  // SC37
  SC3701 = 'mega-discount-settings',
  // SC38
  SC3801 = 'morning-discount-settings',
  // SC40
  SC4001 = 'employee-setting',
  // SC45
  SC4501 = 'product-registration',
  // SC62
  SC6201 = 'image-upload',
  // SC66
  SC6601 = 'master-ticket',
  // SC68
  SC6801 = 'user-setting',
  // SC71
  SC7101 = 'instores',
  SC7102 = 'instores-type',
  // SC71s
  SC7201 = 'change-password',
  // SC73
  SC7301 = 'instores-status-reference',
  // SC74
  SC7401 = 'budget-registration',
  // SC80
  SC8001 = 'master-redistribution',
  // SC81
  SC8101 = 'setup-alert-payment-machine',
  // SC82
  SC8201 = 'master-stores',
  // SC85
  SC8501 = 'deposit-withdraw',
  // SC96
  SC9601 = 'category-discount-receipt-coupon-settings',
  // SC9801
  SC9801 = 'master-setting-business',
  // SC99
  SC9901 = 'master-company-settings',
}

export const accessScreens = (permissions?: Permission[]) =>
  permissions?.map((permission) => permission.alias_name) ?? [];
