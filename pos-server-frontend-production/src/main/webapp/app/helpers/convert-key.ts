// Convert snake_case to camelCase
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// Convert camelCase to snake_case
const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertKeys = (obj: Record<string, any>, converter: (key: string) => string): Record<string, any> => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, converter));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = converter(key);
      acc[newKey] = convertKeys(obj[key], converter);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
};

/**
 *  How to use
 *
 *  const originalObject = {
 *    user_id: 1,
 *    user_name: "John Doe",
 *    user_info: {
 *      birth_date: "1990-01-01",
 *      contact_email: "john@example.com"
 *    },
 *    user_roles: ["admin", "editor"]
 *  }
 *
 *  const camelCaseObject = convertKeys(originalObject, snakeToCamel);
 *  const snakeCaseObject = convertKeys(camelCaseObject, camelToSnake);
 *
 *  */

export { convertKeys, snakeToCamel, camelToSnake };
