import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PHIPAValidationResult, PHIPAViolation, PHIPAWarning } from '../../models/phipa.model';

@Component({
  selector: 'app-compliance-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './compliance-display.component.html',
  styleUrls: ['./compliance-display.component.scss']
})
export class ComplianceDisplayComponent {
  @Input() validationResult?: PHIPAValidationResult;

  get isCompliant(): boolean {
    return this.validationResult?.isCompliant || false;
  }

  get criticalViolations(): PHIPAViolation[] {
    return this.validationResult?.violations.filter(v => v.severity === 'critical') || [];
  }

  get highViolations(): PHIPAViolation[] {
    return this.validationResult?.violations.filter(v => v.severity === 'high') || [];
  }

  get mediumViolations(): PHIPAViolation[] {
    return this.validationResult?.violations.filter(v => v.severity === 'medium') || [];
  }

  get lowViolations(): PHIPAViolation[] {
    return this.validationResult?.violations.filter(v => v.severity === 'low') || [];
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'flag';
      default: return 'help';
    }
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity}`;
  }

  getComplianceScore(): number {
    if (!this.validationResult) return 0;

    const totalIssues = this.validationResult.violations.length + this.validationResult.warnings.length;
    if (totalIssues === 0) return 100;

    const criticalWeight = this.criticalViolations.length * 25;
    const highWeight = this.highViolations.length * 15;
    const mediumWeight = this.mediumViolations.length * 10;
    const lowWeight = this.lowViolations.length * 5;
    const warningWeight = this.validationResult.warnings.length * 2;

    const deduction = criticalWeight + highWeight + mediumWeight + lowWeight + warningWeight;
    return Math.max(0, 100 - deduction);
  }

  getScoreColor(): string {
    const score = this.getComplianceScore();
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  }
}
