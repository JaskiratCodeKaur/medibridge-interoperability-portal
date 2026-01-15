import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FhirDisplayComponent } from '../fhir-display/fhir-display.component';
import { ComplianceDisplayComponent } from '../compliance-display/compliance-display.component';
import { InteroperabilityService, InteroperabilityResult } from '../../services/interoperability.service';

@Component({
  selector: 'app-medibridge',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    FhirDisplayComponent,
    ComplianceDisplayComponent
  ],
  templateUrl: './medibridge.component.html',
  styleUrls: ['./medibridge.component.scss']
})
export class MediBridgeComponent {
  result?: InteroperabilityResult;
  isProcessing = false;
  uploadedFileName = '';

  constructor(private interopService: InteroperabilityService) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadedFileName = file.name;
      this.readFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.uploadedFileName = file.name;
      this.readFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private readFile(file: File): void {
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        this.processData(data);
      } catch (error) {
        alert('Invalid JSON file: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  }

  onTextSubmitted(jsonText: string): void {
    if (!jsonText.trim()) {
      alert('Please enter some JSON data');
      return;
    }

    try {
      const data = JSON.parse(jsonText);
      this.uploadedFileName = 'Pasted JSON';
      this.processData(data);
    } catch (error) {
      alert('Invalid JSON: ' + (error as Error).message);
    }
  }

  private processData(data: any): void {
    this.isProcessing = true;

    // Simulate async processing
    setTimeout(() => {
      this.result = this.interopService.processPatientData(data);
      this.isProcessing = false;
    }, 500);
  }

  clearResults(): void {
    this.result = undefined;
    this.uploadedFileName = '';
  }

  getQualityAssessment(): string {
    if (!this.result) return '';
    return this.interopService.getQualityAssessment(this.result.dataQualityScore);
  }

  getQualityColor(): string {
    if (!this.result) return '#999';
    const score = this.result.dataQualityScore;
    if (score >= 90) return '#4caf50';
    if (score >= 75) return '#8bc34a';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  }
}
