export const getAllWithChoiceTrue = (items) => {
  const result = [];

  const traverse = (arr) => {
    if (arr && arr.length > 0) {
      arr.forEach((item) => {
        if (item?.choice === true) {
          result.push(item);
        }
        if (item?.subRows && item?.subRows.length > 0) {
          traverse(item?.subRows);
        }
      });
    }
  };
  traverse(items);

  return result;
};

export const getAllWithChoiceTrueWithoutSubRows = (items) => {
  const result = [];
  const traverse = (arr) => {
    if (arr && arr?.length > 0) {
      arr.forEach((item) => {
        if (item?.choice === true) {
          const { subRows, ...rest } = item;
          result.push(rest);
        }

        if (item?.subRows && item?.subRows?.length > 0) {
          traverse(item?.subRows);
        }
      });
    }
  };

  traverse(items);

  return result;
};
export const getAllWithChoiceFalse = (items) => {
  const result = [];
  const traverse = (arr) => {
    if (arr && arr?.length > 0) {
      arr.forEach((item) => {
        if (item?.choice === false || !item?.choice) {
          const { subRows, ...rest } = item;
          result.push(rest);
        }

        if (item?.subRows && item?.subRows?.length > 0) {
          traverse(item?.subRows);
        }
      });
    }
  };

  traverse(items);

  return result;
};

export const getDataForModeChecked = (items) => {
  const traverse = (arr) => {
    return arr.flatMap((item) => {
      const filteredSubRows = item.subRows ? traverse(item.subRows) : [];

      if (item.choice || filteredSubRows.length > 0) {
        if (!item.choice && filteredSubRows.length > 0) {
          return filteredSubRows;
        }
        return {
          ...item,
          subRows: filteredSubRows.length > 0 ? filteredSubRows : undefined,
        };
      }
      return [];
    });
  };

  return traverse(items);
};
