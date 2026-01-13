import { Injectable } from '@angular/core';
import { FhirConverterService } from './fhir-converter.service';
import { PhipaValidationService } from './phipa-validation.service';
import { FHIRConversionResult } from '../models/fhir.model';
import { PHIPAValidationResult } from '../models/phipa.model';

export interface InteroperabilityResult {
  originalData: any;
  fhirConversion: FHIRConversionResult;
  phipaValidation: PHIPAValidationResult;
  processedAt: Date;
  dataQualityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class InteroperabilityService {
  constructor(
    private fhirConverter: FhirConverterService,
    private phipaValidator: PhipaValidationService
  ) {}

  /**
   * Process JSON data through the MediBridge pipeline:
   * 1. Convert to FHIR Patient resource
   * 2. Validate PHIPA compliance
   * 3. Calculate data quality score
   */
  processPatientData(jsonData: any): InteroperabilityResult {
    // Step 1: Convert to FHIR
    const fhirConversion = this.fhirConverter.convertToFHIRPatient(jsonData);

    // Step 2: Validate PHIPA compliance on original data
    const phipaValidation = this.phipaValidator.validateData(jsonData);

    // Step 3: Calculate data quality score
    const dataQualityScore = this.calculateDataQualityScore(fhirConversion, phipaValidation);

    return {
      originalData: jsonData,
      fhirConversion,
      phipaValidation,
      processedAt: new Date(),
      dataQualityScore
    };
  }

  /**
   * Calculate a data quality score based on:
   * - FHIR conversion success and completeness
   * - PHIPA compliance
   * - Data completeness
   */
  private calculateDataQualityScore(
    fhirResult: FHIRConversionResult,
    phipaResult: PHIPAValidationResult
  ): number {
    let score = 0;

    // FHIR conversion success (30 points)
    if (fhirResult.success) {
      score += 30;

      // Completeness of FHIR resource (20 points)
      const fhir = fhirResult.fhirResource;
      if (fhir) {
        if (fhir.name && fhir.name.length > 0) score += 5;
        if (fhir.birthDate) score += 5;
        if (fhir.gender) score += 3;
        if (fhir.telecom && fhir.telecom.length > 0) score += 4;
        if (fhir.address && fhir.address.length > 0) score += 3;
      }
    } else {
      // Partial credit for mapping logs
      if (fhirResult.mappingLog && fhirResult.mappingLog.length > 0) {
        score += 10;
      }
    }

    // PHIPA compliance (50 points)
    if (phipaResult.isCompliant) {
      score += 50;
    } else {
      // Deduct points based on violation severity
      const criticalCount = phipaResult.violations.filter(v => v.severity === 'critical').length;
      const highCount = phipaResult.violations.filter(v => v.severity === 'high').length;
      const mediumCount = phipaResult.violations.filter(v => v.severity === 'medium').length;

      const deduction = (criticalCount * 15) + (highCount * 10) + (mediumCount * 5);
      score += Math.max(0, 50 - deduction);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get a human-readable assessment of the data quality
   */
  getQualityAssessment(score: number): string {
    if (score >= 90) return 'Excellent - Ready for interoperability';
    if (score >= 75) return 'Good - Minor improvements needed';
    if (score >= 60) return 'Fair - Several issues to address';
    if (score >= 40) return 'Poor - Major compliance issues';
    return 'Critical - Significant data quality and compliance problems';
  }
}
