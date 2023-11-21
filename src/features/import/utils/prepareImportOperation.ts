import { CellData, ColumnKind, Sheet } from './types';

export type OpsType = {
  fields?: Record<string, CellData>;
  op: 'person.import';
  organizations?: number[];
  tags?: number[];
};
export interface ImportOpsProp {
  ops: OpsType[];
}

export function prepareImportOperations(configData: Sheet): ImportOpsProp {
  const result: ImportOpsProp = { ops: [] };

  configData.columns.forEach((column, colIdx) => {
    if (column.selected) {
      configData.rows.forEach((row, rowIdx) => {
        const rowIndex = configData.firstRowIsHeaders ? rowIdx - 1 : rowIdx;

        if (configData.firstRowIsHeaders && rowIdx === 0) {
          return;
        }

        //Id column
        if (column.kind === ColumnKind.ID_FIELD) {
          result.ops.push({
            fields: {
              [`${column.idField}`]: row.data[colIdx],
            },
            op: 'person.import',
          });
        }

        //fields
        if (column.kind === ColumnKind.FIELD) {
          if (!result.ops[rowIndex]) {
            result.ops.push({ fields: {}, op: 'person.import' });
          }
          result.ops[rowIndex].fields![column.field] = row.data[colIdx];
        }

        //tags and orgs
        if (column.kind === ColumnKind.TAG) {
          if (!result.ops[rowIndex]) {
            result.ops.push({ op: 'person.import', tags: [] });
          }
          result.ops[rowIndex].tags = column.mapping[rowIndex].tags.map(
            (item) => item.id
          );
        }
        if (column.kind === ColumnKind.ORGANIZATION) {
          if (!result.ops[rowIndex]) {
            result.ops.push({
              op: 'person.import',
              organizations: [],
            });
          }
          result.ops[rowIndex].organizations = column.mapping[rowIndex].orgIds;
        }
      });
    }
  });
  return result;
}
