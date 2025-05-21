export interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface TableData {
  columns: TableColumn[];
  rows: any[];
}
