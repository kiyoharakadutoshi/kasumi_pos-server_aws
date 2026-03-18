export const TYPE_TEXT = {
  1: '入金',
  2: '出金',
};

export const RECORD_STATUS = {
  delete: 'delete',
  old: 'old',
  new: 'new',
  edit: 'edit',
};

export const MAX_LENGTH = {
  code: 3,
  name: 20,
};

export const INPUT_ID = {
  code__new: 'code__new',
  name__new: 'name__new',
  code__edit: 'code__edit',
  name__edit: 'name__edit',
};

export const MAX_TABLE_HEIGHT = 665;

export const LIST_TYPE = [
  {
    value: 1,
    code: 1,
    name: '入金',
  },
  {
    value: 2,
    code: 2,
    name: '出金',
  },
]

export const DEFAULT_SELECT_ITEM ={
  deposit_withdrawal_code: '',
  deposit_withdrawal_name: '',
  deposit_withdrawal_type: 1,
  record_id: 0,
  currentStatus: 'default',
  prevStatus: 'default',
}

export const DEFAULT_STATUS_BUTTON = {
  disableClear: false,
  disableDelete: false,
  disableAdd: false,
  disableEdit: true,
  disableConfirm: true,
}

export const DEFAULT_FORM_TABLE = {
  code__new: '',
  name__new: '',
  type__new: 1,
  code__edit: '',
  name__edit: '',
  type__edit: 1,
}
