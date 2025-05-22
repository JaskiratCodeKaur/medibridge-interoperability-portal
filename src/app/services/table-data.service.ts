import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableColumn, TableData } from '../models/table-data.model';

@Injectable({
  providedIn: 'root'
})
export class TableDataService {
  private tableDataSubject = new BehaviorSubject<TableData | null>(null);
  public tableData$: Observable<TableData | null> = this.tableDataSubject.asObservable();

  constructor() { }

  updateTableData(data: TableData): void {
    console.log('Updating table data:', data);
    this.tableDataSubject.next(data);
  }

  processJsonFile(file: File): Promise<TableData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          console.log('File loaded, parsing JSON...');
          const content = e.target?.result as string;
          console.log('File content:', content.substring(0, 200));
          const jsonData = JSON.parse(content);
          console.log('Parsed JSON:', jsonData);
          
          // Handle different JSON structures
          let dataArray: any[] = [];
          
          if (Array.isArray(jsonData)) {
            dataArray = jsonData;
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            // If it's an object, check if it has an array property
            const firstArrayProp = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
            if (firstArrayProp) {
              dataArray = jsonData[firstArrayProp];
            } else {
              // If no array found, treat the object as a single row
              dataArray = [jsonData];
            }
          }

          console.log('Data array:', dataArray);

          if (dataArray.length === 0) {
            reject(new Error('No data found in JSON file'));
            return;
          }

          const tableData = this.convertToTableData(dataArray);
          console.log('Converted table data:', tableData);
          this.tableDataSubject.next(tableData);
          resolve(tableData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          reject(new Error('Invalid JSON file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        console.error('Error reading file');
        reject(new Error('Error reading file'));
      };

      console.log('Reading file as text...');
      reader.readAsText(file);
    });
  }

  convertToTableData(data: any[]): TableData {
    // Extract all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(obj => {
      Object.keys(obj).forEach(key => allKeys.add(key));
    });

    // Create columns with type detection
    const columns: TableColumn[] = Array.from(allKeys).map(key => ({
      key,
      label: this.formatLabel(key),
      type: this.detectType(data, key)
    }));

    return {
      columns,
      rows: data
    };
  }

  private formatLabel(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private detectType(data: any[], key: string): 'string' | 'number' | 'boolean' | 'date' {
    const samples = data
      .map(obj => obj[key])
      .filter(val => val !== null && val !== undefined)
      .slice(0, 10); // Sample first 10 values

    if (samples.length === 0) return 'string';

    // Check if all samples are boolean
    if (samples.every(val => typeof val === 'boolean')) {
      return 'boolean';
    }

    // Check if all samples are numbers
    if (samples.every(val => typeof val === 'number' || !isNaN(Number(val)))) {
      return 'number';
    }

    // Check if all samples are dates
    if (samples.every(val => !isNaN(Date.parse(val)))) {
      return 'date';
    }

    return 'string';
  }

  clearData(): void {
    this.tableDataSubject.next(null);
  }
}
