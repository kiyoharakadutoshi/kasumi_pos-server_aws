import { BUDGET_AMOUNT_MAX_LENGTH, MAX_LENGTH_PASSWORD, MIN_LENGTH_PASSWORD } from '@/constants/constants';

const belongTo = {
  item_code: {
    MSG_VAL_001: ['touchMenu.PLU'],
    MSG_VAL_002: ['touchMenu.PLU', 13],
  },
};

/*
  SC1501, SC1502
 */

const paramSuggestProduct = {
  item_code: {
    MSG_VAL_002: ['touchMenu.PLU', 13],
  },
  group_code: {
    MSG_VAL_002: ['touchMenu.productCode', 8],
  },
  product_code: {
    MSG_VAL_002: ['touchMenu.productCode', 8],
  },
};

const presetDetail = {
  preset_menu: {
    MSG_VAL_019: ['paramApi.preset_menu'],
  },
  page_number: {
    MSG_VAL_001: ['detailMenu.presetTab.title'],
    MSG_VAL_019: ['detailMenu.presetTab.title']
  },
  preset_menu_button: {
    MSG_VAL_019: ['paramApi.preset_menu_button'],
  },
  preset_layout_code: {
    MSG_VAL_001: ['touchMenu.presetLayoutCode'],
    MSG_VAL_002: ['touchMenu.presetLayoutCode', 5],
    MSG_ERR_003: ['touchMenu.presetLayoutCode'],
  },
  apply_date: {
    MSG_VAL_001: ['touchMenu.table.applyDate'],
    MSG_VAL_022: ['touchMenu.table.applyDate'],
    MSG_VAL_019: ['touchMenu.table.applyDate']
  },
  preset_layout_name: {
    MSG_VAL_001: ['touchMenu.table.presetLayoutName'],
    MSG_VAL_002: ['touchMenu.table.presetLayoutName', 50],
  },
  booking_date: {
    MSG_VAL_001: ['touchMenu.table.applyDate'],
    MSG_VAL_022: ['touchMenu.table.applyDate'],
    MSG_VAL_019: ['touchMenu.table.applyDate']
  },
  group_code: {
    MSG_VAL_019: ['paramApi.groupCode'],
  },
  description: {
    MSG_VAL_002: ['paramApi.descriptionPreset', 50],
    MSG_VAL_019: ['paramApi.descriptionPreset'],
  },
  display_status: {
    MSG_VAL_019: ['detailMenu.buttonTab.disableButton'],
  },
};

const codeMaster = {
  master_code: {
    MSG_VAL_001: ['paramApi.codeMaster'],
  },
};

const copyPreset = {
  preset_layout_code: {
    MSG_VAL_001: ['touchMenu.presetLayoutCode'],
  },
  items: {
    MSG_VAL_001: ['paramApi.itemsCopyPreset'],
  },
};

const presetImage = {
  type: {
    MSG_VAL_001: ['paramApi.typeImage'],
  },
};

/*
  End SC1501, SC1502
 */

/*
  Start SC71
 */

const cashRegisterDetail = {
  code: {
    MSG_VAL_001: ['settingMaster.table.machineCode'],
  },
};

const cashRegisterMaintenance = {
  code: {
    MSG_VAL_001: ['settingMaster.table.machineCode'],
    MSG_VAL_002: ['settingMaster.table.machineCode', '4'],
    MSG_VAL_026: ['settingMaster.table.machineCode'],
  },
  type_code: {
    MSG_VAL_001: ['settingMaster.csvHeader.cashRegisterTypeCode'],
    MSG_VAL_019: ['settingMaster.csvHeader.cashRegisterTypeCode'],
  },
  type_node: {
    MSG_VAL_001: ['settingMaster.csvHeader.cashRegisterTypeNote'],
    MSG_VAL_019: ['settingMaster.csvHeader.cashRegisterTypeNote'],
  },
  button_layout_code: {
    MSG_VAL_001: ['touchMenu.presetLayoutCode'],
    MSG_VAL_019: ['touchMenu.presetLayoutCode'],
  },
  keyboard_layout_code: {
    MSG_VAL_001: ['settingMaster.csvHeader..keyboardLayoutCode'],
    MSG_VAL_019: ['settingMaster.csvHeader..keyboardLayoutCode'],
  },
  function_layout_code: {
    MSG_VAL_001: ['settingMaster.csvHeader.functionLayoutCode'],
    MSG_VAL_019: ['settingMaster.csvHeader.functionLayoutCode'],
  },
  receipt_message_code: {
    MSG_VAL_001: ['settingMaster.csvHeader.messageReceiptCode'],
    MSG_VAL_019: ['settingMaster.csvHeader.messageReceiptCode'],
  },
};

const cashRegisterTypeUpdate = {
  code: {
    MSG_VAL_001: ['addPaymentMachine.table.code'],
    MSG_VAL_002: ['addPaymentMachine.table.code', 2],
    MSG_VAL_048: ['addPaymentMachine.table.code', 'addPaymentMachine.table.typeCashRegister'],
    MSG_VAL_079: ['addPaymentMachine.errorMsg.MSG_VAL_079']
  },
  name: {
    MSG_VAL_001: ['addPaymentMachine.table.typeCashRegister'],
    MSG_VAL_002: ['addPaymentMachine.table.typeCashRegister', 50],
    MSG_VAL_048: ['addPaymentMachine.table.code', 'addPaymentMachine.table.typeCashRegister'],
  },
};

const searchJournalError = {
  business_time_from: {
    MSG_VAL_004: ['searchJournal.msgVal.MSG_VAL_004_timeFrom', 'searchJournal.msgVal.MSG_VAL_004_timeTo'],
  },
};
const masterCategoryError = {
  end_service_time: {
    MSG_VAL_022: [''],
  },
  end_date_time: {
    MSG_VAL_022: [''],
  },
  apply_date: {
    MSG_VAL_001: ['masterCategory.start_date'],
    MSG_VAL_016: ['masterCategory.start_date'],
  },
  start_service_time: {
    MSG_VAL_051: [''],
  },
};

const importFile = {
  file: {
    MSG_VAL_030: [''],
  },
};

const languageVal = {
  language: {
    MSG_VAL_019: ['global.menu.language'],
  },
};

/*
  End SC71
 */

/*
  SC0301
 */

const paramListSpecialPromotion = {
  promotion_code: {
    MSG_VAL_001: ['specialPromotion.promotionCode'],
    MSG_VAL_002: ['specialPromotion.promotionCode', 5],
    MSG_VAL_006: ['specialPromotion.promotionCode'],
  },
  md_hierachy_code_level_one: {
    MSG_VAL_002: ['specialPromotion.hierachyCode', 2],
  },
};

const paramDetailPromotion = {
  promotion_code: {
    MSG_VAL_001: ['specialPromotion.promotionCode'],
    MSG_VAL_002: ['specialPromotion.promotionCode', 5],
    MSG_VAL_006: ['specialPromotion.promotionCode'],
  },
};

const paramChangePasword = {
  current_password: {
    MSG_VAL_001: ['changePasswordScreen.currentPassword'],
    MSG_VAL_064: ['changePasswordScreen.currentPassword'],
  },
  new_password: {
    MSG_VAL_001: ['changePasswordScreen.newPassword'],
    MSG_VAL_056: ['changePasswordScreen.newPassword', MIN_LENGTH_PASSWORD, MAX_LENGTH_PASSWORD],
  },
  confirm_new_password: {
    MSG_VAL_001: ['changePasswordScreen.confirmNewPassword'],
    MSG_VAL_057: ['changePasswordScreen.newPassword', 'changePasswordScreen.confirmNewPassword'],
  },
};

const paramDeleteProduct = {
  product: {
    MSG_VAL_063: [],
  },
};

const paramProductUpdate = {
  record_id: {
    MSG_VAL_001: ['ID'],
  },
  unit_price: {
    MSG_VAL_019: ["productInfo.unit_price"]
  },
  item_code: {
    MSG_VAL_001: ['productManagement.pluCode'],
    MSG_VAL_019: ['productManagement.pluCode'],
  },
  tax_group_code: {
    MSG_VAL_001: ['productInfo.tax_group_code'],
    MSG_VAL_019: ['productInfo.tax_group_code'],
  },
  code_level_one: {
    MSG_VAL_001: ['productInfo.code_level_one'],
    MSG_VAL_019: ['productInfo.code_level_one'],
  },
  code_level_two: {
    MSG_VAL_001: ['productInfo.code_level_two'],
    MSG_VAL_019: ['productInfo.code_level_two'],
  },
  code_level_three: {
    MSG_VAL_001: ['productInfo.'],
    MSG_VAL_019: ['productInfo.code_level_three'],
  },
  code_level_four: {
    MSG_VAL_019: ['productInfo.code_level_four'],
  },
  standard_price: {
    MSG_VAL_001: ['productInfo.standard_price'],
    MSG_VAL_002: ['productInfo.standard_price', 6],
  },
  member_price: {
    MSG_VAL_001: ['productInfo.member_price'],
    MSG_VAL_002: ['productInfo.member_price', 6],
    MSG_VAL_019: ["productInfo.member_price"]
  },
  original_price: {
    MSG_VAL_001: ['productInfo.original_price'],
    MSG_VAL_002: ['productInfo.original_price', 6],
    MSG_VAL_019: ['productInfo.original_price'],
  },
  product_name: {
    MSG_VAL_001: ['productInfo.product_name'],
    MSG_VAL_004: ['productInfo.product_name', 50],
  },
  receipt_name: {
    MSG_VAL_001: ['productInfo.receipt_name'],
    MSG_VAL_004: ['productInfo.receipt_name', 50],
  },
  kana_name: {
    MSG_VAL_001: ['productInfo.kana_name'],
    MSG_VAL_004: ['productInfo.kana_name', 25],
  },
  is_item_manual_discount: {
    MSG_VAL_001: ['productInfo.is_item_manual_discount'],
  },
  is_sub_total_discount: {
    MSG_VAL_001: ['productInfo.is_sub_total_discount'],
  },
  storage_time: {
    MSG_VAL_006: ['productInfo.storage_time'],
    MSG_VAL_002: ['productInfo.storage_time'],
  },
};

const paramSuggestProductHierarchy = {
  code_level_one: {
    MSG_VAL_001: ['部門'],
    MSG_VAL_019: ['部門'],
  },
};

const userLoginSite = {
  store_code: {
    MSG_VAL_019: ['userSetting.store'],
  },
  role: {
    MSG_VAL_019: ['userSetting.userRole'],
  },
};

const userLoginSiteMaintenance = {
  user_id: {
    MSG_VAL_071: [''],
    MSG_VAL_072: [''],
  },
};

const cashRegisterReportParam = {
  business_type: {
    MSG_VAL_001: ['detailCashRegisterReport.type'],
    MSG_VAL_019: ['detailCashRegisterReport.type'],
  },
  start_period: {
    MSG_VAL_001: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_016: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_019: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_004: ['listCashRegisterReport.startDateReport', 'listCashRegisterReport.endDateReport'],
  },
  end_period: {
    MSG_VAL_016: ['listCashRegisterReport.endDateReport'],
    MSG_VAL_070: [3],
  },
  cash_register_code: {
    MSG_VAL_001: ['detailCashRegisterReport.cashier'],
    MSG_VAL_019: ['detailCashRegisterReport.cashier'],
  },
  cash_register_name: {
    MSG_VAL_001: ['detailCashRegisterReport.cashier'],
    MSG_VAL_019: ['detailCashRegisterReport.cashier'],
  },
  lang: {
    MSG_VAL_001: ['language'],
  },
};

const combinationsMaintenance = {
  promotion_code: {
    MSG_VAL_001: ['specialPromotion.promotionCode'],
    MSG_VAL_006: ['specialPromotion.promotionCode'],
    MSG_VAL_019: ['specialPromotion.promotionCode'],
    MSG_VAL_028: ['specialPromotion.promotionCode', '5'],
  },
  code: {
    MSG_VAL_001: ['mixMatchs.mixMatchCode'],
    MSG_VAL_006: ['mixMatchs.mixMatchCode'],
    MSG_VAL_028: ['mixMatchs.mixMatchCode', '3'],
    MSG_VAL_054: ['mixMatchs.mixMatchCode'],
  },
  start_date: {
    MSG_VAL_001: ['specialPromotion.start_date'],
    MSG_VAL_003: ['specialPromotion.start_date'],
    MSG_VAL_022: ['specialPromotion.start_date'],
  },
  start_time: {
    MSG_VAL_003: ['specialPromotion.start_time'],
  },
  end_date: {
    MSG_VAL_001: ['specialPromotion.end_date'],
    MSG_VAL_003: ['specialPromotion.end_date'],
    MSG_VAL_022: ['specialPromotion.end_date'],
  },
  end_time: {
    MSG_VAL_003: ['specialPromotion.end_time'],
    MSG_VAL_004: ['specialPromotion.end_time'],
    MSG_VAL_022: ['specialPromotion.end_time'],
  },
  time_service: {
    MSG_VAL_019: ['specialPromotion.timeService'],
  },
  type: {
    MSG_VAL_019: ['mixMatchs.type'],
  },
  status: {
    MSG_VAL_019: ['mixMatchs.status']
  },
  quantity: {
    MSG_VAL_001: ['mixMatchs.quantity'],
    MSG_VAL_002: ['mixMatchs.quantity', '99'],
    MSG_VAL_021: ['mixMatchs.quantity', '1'],
    MSG_VAL_053: ['mixMatchs.quantity'],
  },
  value: {
    MSG_VAL_001: ['mixMatchs.value'],
    MSG_VAL_002: ['mixMatchs.value', '6'],
    MSG_VAL_019: ['mixMatchs.value'],
  },
  plu_code: {
    MSG_VAL_001: ['mixMatchs.itemCode'],
    MSG_VAL_006: ['mixMatchs.itemCode'],
    MSG_VAL_028: ['mixMatchs.itemCode', '13'],
  }
};

const budgetParam = {
  apply_date: {
    MSG_VAL_001: ['budgetRegistration.conditionSearchLabel.settingMonth'],
    MSG_VAL_016: ['budgetRegistration.conditionSearchLabel.settingMonth'],
  },
  md_hierarchy_code: {
    MSG_VAL_001: ['budgetRegistration.conditionSearchLabel.productGroup'],
    MSG_VAL_002: ['budgetRegistration.conditionSearchLabel.productGroup', '2'],
    MSG_VAL_026: ['budgetRegistration.conditionSearchLabel.productGroup'],
    MSG_VAL_017: ['budgetRegistration.conditionSearchLabel.productGroup'],
  },
  items: {
    MSG_VAL_001: ['budgetRegistration.title'],
    MSG_VAL_019: ['budgetRegistration.title'],
  },
  budget: {
    MSG_VAL_002: ['budgetRegistration.table.budgetAmount', BUDGET_AMOUNT_MAX_LENGTH],
  },
};

const masterCompanySettingsParam = {
  company_code: {
    MSG_VAL_002: ['masterCompany.companyCode', '10']
  },
  company_name: {
    MSG_VAL_002: ['masterCompany.companyName', '50']
  },
  company_name_official: {
    MSG_VAL_002: ['masterCompany.companyNameOfficial', '50']
  },
  company_name_official_short: {
    MSG_VAL_002: ['masterCompany.companyNameOfficialShort', '50']
  },
  age_verification_ptn: {
    MSG_VAL_019: ['masterCompany.ageVerification']
  },
  registration_number: {
    MSG_VAL_002: ['masterCompany.registrationNumber', '14'],
  },
  payment: {
    MSG_VAL_075: ['payment']
  }
}

const checkExistStore = {
  plu: {
    MSG_VAL_002: ['children.item_code'],
    MSG_VAL_032: ['children.item_code'],
  },
};

const suggestChild = {
  parent_item_code: {
    MSG_VAL_068: [''],
  },
  parent_plu: {
    MSG_VAL_001: ['children.item_code'],
    MSG_VAL_044: [''],
  },
};

const productDetail = {
  my_company_code: {
    MSG_VAL_001: ['productManagement.productCode'],
    MSG_VAL_026: ['productManagement.productCode'],
    MSG_VAL_002: ['productManagement.productCode', '13'],
  },
  plu: {
    MSG_VAL_001: ['children.item_code'],
    MSG_VAL_026: ['children.item_code'],
    MSG_VAL_002: ['children.item_code', '13'],
  },
};

const cashRegisterRevenueParam = {
  business_type: {
    MSG_VAL_001: ['productRevenuePos.business'],
    MSG_VAL_019: ['productRevenuePos.business'],
  },
  start_date: {
    MSG_VAL_001: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_004: ['listCashRegisterReport.startDateReport', 'listCashRegisterReport.endDateReport'],
    MSG_VAL_016: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_019: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_070: ['listCashRegisterReport.startDateReport'],
  },
  end_date: {
    MSG_VAL_001: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_016: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_019: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_049: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_070: ['listCashRegisterReport.startDateReport'],
  },
  cash_register_code: {
    MSG_VAL_001: ['productRevenuePos.registerNumber'],
  },
  md_hierarchy_level: {
    MSG_VAL_019: ['productRevenuePos.outputUnits'],
  },
  md_hierarchy_code: {
    MSG_VAL_001: ['productRevenuePos.outputUnits'],
    MSG_VAL_006: ['productRevenuePos.outputUnits'],
  },
  plu_code: {
    MSG_VAL_001: ['productRevenuePos.pluCode'],
    MSG_VAL_006: ['productRevenuePos.pluCode'],
  },
  limit: {
    MSG_VAL_001: ['productRevenuePos.limitRecord'],
    MSG_VAL_019: ['productRevenuePos.limitRecord'],
  }
};

const employeeImport = {
  file: {
    MSG_VAL_033: ['CSV']
  }
}

const ishidaProductValidate = {
  company_code: {
    MSG_VAL_001: ['masterCompany.companyCode'],
  },
  item_code: {
    MSG_VAL_001: ['touchMenu.PLU'],
    MSG_VAL_002: ['touchMenu.PLU', 13],
  },
  current_price: {
    MSG_VAL_001: ['changePrice.newPrice'],
    MSG_VAL_002: ['changePrice.newPrice', 6],
    MSG_VAL_038: ['changePrice.newPrice', 0],
    MSG_VAL_007: ['changePrice.newPrice'],
  },
}

const batchReportSearch = {
  start_date: {
    MSG_VAL_001: ['listCashRegisterReport.startDateReport'],
    MSG_VAL_016: ['listCashRegisterReport.startDateReport'],
  },
  end_date: {
    MSG_VAL_001: ['listCashRegisterReport.endDateReport'],
    MSG_VAL_016: ['listCashRegisterReport.endDateReport'],
  }
}

export const urlError = {
  'product/suggest': paramSuggestProduct,
  'product/belong-to': belongTo,
  'cash-registers/import': importFile,
  'presets/detail': presetDetail,
  'presets/check-exist': presetDetail,
  'preset/maintenance': presetDetail,
  'preset/maintenance/list': presetDetail,
  'code-master': codeMaster,
  'preset/copy': copyPreset,
  'preset-images': presetImage,
  'cash-registers/export': languageVal,
  'cash-registers/': cashRegisterDetail,
  'cash-register-type/maintainance': cashRegisterTypeUpdate,
  'cash-registers/maintenance': cashRegisterMaintenance,
  journals: searchJournalError,
  'promotion/detail': paramDetailPromotion,
  'special-prices': paramListSpecialPromotion,
  'auth/change-password': paramChangePasword,
  'product/delete': paramDeleteProduct,
  'product/update': paramProductUpdate,
  'product/hierarchy-level': paramSuggestProductHierarchy,
  'discount-categories/maintenance': masterCategoryError,
  'user-login-site': userLoginSite,
  'combinations/maintenance': combinationsMaintenance,
  'report/sales/cash-register': cashRegisterReportParam,
  'report/sales/cash-register/detail/export': cashRegisterReportParam,
  'report/sales/cash-register/detail': cashRegisterReportParam,
  'report/sales/cash-register-revenue': cashRegisterRevenueParam,
  'product/suggest-child': suggestChild,
  'user-login-site/maintenance': userLoginSiteMaintenance,
  budgets: budgetParam,
  'product/existed': checkExistStore,
  'product/detail': productDetail,
  'employees/import': employeeImport,
  'company/update': masterCompanySettingsParam,
  'ishida/product/change': ishidaProductValidate,
  'ishida/product/suggest': paramSuggestProduct,
  'ishida/batch-report/search': batchReportSearch
};

// Common param validate
const paramStoreValues = {
  MSG_VAL_001: ['paramApi.store'],
  MSG_VAL_026: ['paramApi.store'],
  MSG_VAL_002: ['paramApi.store', 5],
};

const paramOperationTypeValues = {
  MSG_VAL_001: ['paramApi.operationType'],
  MSG_VAL_019: ['paramApi.operationType'],
};

export const paramErrorCommon = {
  selected_stores: paramStoreValues,
  selected_store: paramStoreValues,
  store_code: paramStoreValues,
  store: paramStoreValues,
  target_stores: paramStoreValues,
  operation_type: paramOperationTypeValues,
  file: { MSG_VAL_030: [''] },
  plu: {
    MSG_VAL_001: ['productManagement.pluCode'],
    MSG_VAL_019: ['productManagement.pluCode'],
  },
  my_company_code: {
    MSG_VAL_001: ['productManagement.productCode'],
    MSG_VAL_019: ['productManagement.productCode'],
  },
};
