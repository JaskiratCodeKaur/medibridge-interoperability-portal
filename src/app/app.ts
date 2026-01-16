import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MediBridgeComponent } from './components/medibridge/medibridge.component';

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
    MediBridgeComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Healthcare Interoperability Suite');

  openHelp(): void {
    alert('MediBridge Interoperability Portal\n\nUpload patient data in JSON format to:\n• Convert to HL7 FHIR R4 standard\n• Assess data quality\n\nSample files available in /sample-data/ folder.');
  }

  scrollToUpload(): void {
    const uploadElement = document.querySelector('app-file-upload');
    if (uploadElement) {
      uploadElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
