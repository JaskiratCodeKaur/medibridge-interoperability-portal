import { Component, EventEmitter, Output, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableDataService } from '../../services/table-data.service';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() fileProcessed = new EventEmitter<void>();
  
  fileName: string = '';
  isProcessing: boolean = false;
  error: string = '';
  jsonText: string = '';

  constructor(
    private tableDataService: TableDataService,
    private ngZone: NgZone
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private processFile(file: File): void {
    this.error = '';
    
    if (!file.name.endsWith('.json')) {
      this.error = 'Please select a JSON file';
      return;
    }

    this.fileName = file.name;
    this.isProcessing = true;

    console.log('Starting to process file:', file.name);

    this.tableDataService.processJsonFile(file)
      .then((data) => {
        console.log('File processed successfully:', data);
        this.ngZone.run(() => {
          this.isProcessing = false;
          this.fileProcessed.emit();
          console.log('Processing state reset, isProcessing:', this.isProcessing);
        });
      })
      .catch((error) => {
        console.error('Error processing file:', error);
        this.ngZone.run(() => {
          this.isProcessing = false;
          this.error = error.message || 'Error processing file';
          this.fileName = '';
        });
      })
      .finally(() => {
        // Force reset processing state after 1 second as failsafe
        setTimeout(() => {
          if (this.isProcessing) {
            console.warn('Force resetting isProcessing flag');
            this.isProcessing = false;
          }
        }, 1000);
      });
  }

  clearFile(): void {
    this.fileName = '';
    this.error = '';
    this.isProcessing = false;
    this.tableDataService.clearData();
  }

  forceReset(): void {
    console.log('Force reset called');
    this.isProcessing = false;
    this.error = '';
  }

  processTextInput(): void {
    this.error = '';
    
    if (!this.jsonText.trim()) {
      this.error = 'Please enter JSON text';
      return;
    }

    this.isProcessing = true;
    this.fileName = 'text-input.json';

    console.log('Starting to process JSON text');

    try {
      const jsonData = JSON.parse(this.jsonText);
      const tableData = this.tableDataService.convertToTableData(jsonData);
      
      this.tableDataService.updateTableData(tableData);
      
      console.log('Text processed successfully:', tableData);
      this.ngZone.run(() => {
        this.isProcessing = false;
        this.fileProcessed.emit();
        console.log('Processing state reset, isProcessing:', this.isProcessing);
      });
    } catch (error: any) {
      console.error('Error processing JSON text:', error);
      this.ngZone.run(() => {
        this.isProcessing = false;
        this.error = error.message || 'Invalid JSON format';
        this.fileName = '';
      });
    } finally {
      setTimeout(() => {
        if (this.isProcessing) {
          console.warn('Force resetting isProcessing flag');
          this.isProcessing = false;
        }
      }, 1000);
    }
  }

  clearTextInput(): void {
    this.jsonText = '';
    this.clearFile();
  }
}
