import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { HelpDialogComponent } from './components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    FileUploadComponent,
    DynamicTableComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Table Builder');

  constructor(private dialog: MatDialog) {}

  openHelp(): void {
    this.dialog.open(HelpDialogComponent, {
      width: '600px',
      panelClass: 'help-dialog'
    });
  }

  scrollToUpload(): void {
    const uploadElement = document.querySelector('app-file-upload');
    if (uploadElement) {
      uploadElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
