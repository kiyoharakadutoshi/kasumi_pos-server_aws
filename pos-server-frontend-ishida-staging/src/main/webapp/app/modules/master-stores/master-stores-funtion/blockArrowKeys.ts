import { ARROW_KEYS } from '@/constants/constants';

export const blockArrowKeys = (event: React.KeyboardEvent<HTMLElement>) => {
  const blockedKeys = Object.values(ARROW_KEYS);
  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
  }
};
