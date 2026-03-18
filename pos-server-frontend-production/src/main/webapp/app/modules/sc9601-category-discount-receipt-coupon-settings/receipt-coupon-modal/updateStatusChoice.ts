export function setStatusChoiceAll(array, statusChoice: boolean) {
  function recursiveUpdate(node) {
    node.choice = statusChoice;
    if (node.subRows && node.subRows.length > 0) {
      node.subRows.forEach((child) => recursiveUpdate(child));
    }
  }
  array.forEach((item) => recursiveUpdate(item));
  return array;
}

export function updateChoices(data, updates) {
  const updateCodes = new Set(updates?.map((item) => item?.md_hierarchy_code));
  function recursiveUpdate(node) {
    if (updateCodes.has(node?.md_hierarchy_code)) {
      node.choice = false;
    }
    if (node?.subRows && node?.subRows.length > 0) {
      node?.subRows?.forEach((child) => recursiveUpdate(child));
    }
  }

  data?.forEach((item) => recursiveUpdate(item));
  return data;
}
