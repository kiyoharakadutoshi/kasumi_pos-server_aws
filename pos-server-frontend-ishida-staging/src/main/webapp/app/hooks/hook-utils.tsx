import { useAppSelector } from 'app/config/store';
import { isEqual, isInageyaCompany } from 'app/helpers/utils';
import { USER_ROLE } from 'app/constants/constants';

export const UserRole = () => {
  const roleCode = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const isAdmin = isEqual(roleCode, USER_ROLE.ADMIN);
  const isHead = isEqual(roleCode, USER_ROLE.HEAD);
  const isStore = isEqual(roleCode, USER_ROLE.STORE) || (!isAdmin && !isHead);
  return { isAdmin, isHead, isStore };
};

export const isInageyaHook = () =>
  isInageyaCompany(useAppSelector((state) => state.loginReducer.selectedCompany)?.value);
