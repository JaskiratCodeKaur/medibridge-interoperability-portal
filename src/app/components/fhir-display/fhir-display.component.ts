import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { FHIRConversionResult, FHIRPatient, FHIRContactPoint, FHIRIdentifier } from '../../models/fhir.model';

@Component({
  selector: 'app-fhir-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './fhir-display.component.html',
  styleUrls: ['./fhir-display.component.scss']
})
export class FhirDisplayComponent {
  @Input() conversionResult?: FHIRConversionResult;

  get fhirPatient(): FHIRPatient | undefined {
    return this.conversionResult?.fhirResource;
  }

  get isSuccess(): boolean {
    return this.conversionResult?.success || false;
  }

  copyToClipboard(): void {
    if (this.fhirPatient) {
      const jsonString = JSON.stringify(this.fhirPatient, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert('FHIR resource copied to clipboard!');
      });
    }
  }

  downloadFHIR(): void {
    if (this.fhirPatient) {
      const jsonString = JSON.stringify(this.fhirPatient, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fhir-patient-${this.fhirPatient.id}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  getNameDisplay(): string {
    if (!this.fhirPatient?.name || this.fhirPatient.name.length === 0) {
      return 'N/A';
    }

    const name = this.fhirPatient.name[0];
    if (name.text) {
      return name.text;
    }

    const parts: string[] = [];
    if (name.prefix) parts.push(...name.prefix);
    if (name.given) parts.push(...name.given);
    if (name.family) parts.push(name.family);
    if (name.suffix) parts.push(...name.suffix);

    return parts.join(' ') || 'N/A';
  }

  getTelecomDisplay(system: string): string {
    if (!this.fhirPatient?.telecom) {
      return 'N/A';
    }

    const contact = this.fhirPatient.telecom.find((t: FHIRContactPoint) => t.system === system);
    return contact?.value || 'N/A';
  }

  getAddressDisplay(): string {
    if (!this.fhirPatient?.address || this.fhirPatient.address.length === 0) {
      return 'N/A';
    }

    const addr = this.fhirPatient.address[0];
    if (addr.text) {
      return addr.text;
    }

    const parts: string[] = [];
    if (addr.line) parts.push(...addr.line);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postalCode) parts.push(addr.postalCode);
    if (addr.country) parts.push(addr.country);

    return parts.join(', ') || 'N/A';
  }

  getIdentifierDisplay(): string[] {
    if (!this.fhirPatient?.identifier || this.fhirPatient.identifier.length === 0) {
      return [];
    }

    return this.fhirPatient.identifier.map((id: FHIRIdentifier) => {
      const type = id.type?.coding?.[0]?.display || 'Identifier';
      const value = id.value || 'N/A';
      return `${type}: ${value}`;
    });
  }
}
