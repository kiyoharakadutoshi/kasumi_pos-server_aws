import { IHierarchyLevelInfo } from '@/services/hierarchy-level-service';
import { IHierarchyLevel } from './product-report-interface';

export const transformData = (data: IHierarchyLevelInfo[]) => {
  let listDataLevelOneUnique: IHierarchyLevelInfo[] = [];
  const uniqueCodeLevels = new Set<string>();
  listDataLevelOneUnique = data?.filter((item) => {
    if (!uniqueCodeLevels.has(item.code_level_one)) {
      uniqueCodeLevels.add(item.code_level_one);
      return true;
    }
    return false;
  });

  const listLevelOne: IHierarchyLevel[] = [];
  listDataLevelOneUnique.map((item) => {
    const levelOne = {
      code_level_one: item?.code_level_one,
      description: item?.description_level_one,
      md_hierarchy_code: item?.code_level_one,
      md_hierarchy_level: item?.level_one,
      subRows: [],
    };
    listLevelOne.push(levelOne);
  });

  listLevelOne.map((levelOneItem) => {
    data.forEach((item) => {
      if (levelOneItem.code_level_one !== item.code_level_one) {
        return;
      }

      let levelTwo = levelOneItem.subRows.find((row) => row.code_level_two === item.code_level_two);
      if (!levelTwo && item.code_level_two) {
        levelTwo = {
          code_level_two: item.code_level_two,
          description: item.description_level_two,
          md_hierarchy_code: item.code_level_two,
          md_hierarchy_level: item.level_two,
          subRows: [],
        };
        levelOneItem.subRows.push(levelTwo);
      }

      let levelThree = levelTwo?.subRows.find((row) => row.code_level_three === item.code_level_three);
      if (!levelThree && item.code_level_three) {
        levelThree = {
          code_level_three: item.code_level_three,
          description: item.description_level_three,
          md_hierarchy_code: item.code_level_three,
          md_hierarchy_level: item.level_three,
          subRows: [],
        };
        levelTwo?.subRows.push(levelThree);
      }

      let levelFour = levelThree?.subRows.find((row) => row.code_level_four === item.code_level_four);
      if (!levelFour && item.code_level_four) {
        levelFour = {
          code_level_four: item.code_level_four,
          description: item.description_level_four,
          md_hierarchy_code: item.code_level_four,
          md_hierarchy_level: item.level_four,
          subRows: [],
        };
        levelThree?.subRows.push(levelFour);
      }
    });
  });

  return listLevelOne;
};
