import { Injectable } from '@angular/core';
import {
  PHIPAValidationResult,
  PHIPAViolation,
  PHIPAWarning,
  PHIPAViolationType,
  SensitiveFieldPattern
} from '../models/phipa.model';

@Injectable({
  providedIn: 'root'
})
export class PhipaValidationService {
  private sensitivePatterns: SensitiveFieldPattern[] = [
    {
      type: PHIPAViolationType.SIN,
      fieldNamePattern: /sin|social.?insurance|ssn/i,
      valuePattern: /^\d{3}[-\s]?\d{3}[-\s]?\d{3}$/,
      severity: 'critical',
      description: 'Social Insurance Numbers must not be stored or transmitted in plain text'
    },
    {
      type: PHIPAViolationType.CREDIT_CARD,
      fieldNamePattern: /credit.?card|card.?number|cc.?num/i,
      valuePattern: /^(?:\d{4}[-\s]?){3}\d{4}$/,
      severity: 'critical',
      description: 'Credit card numbers are not permitted in health data systems'
    },
    {
      type: PHIPAViolationType.BANK_ACCOUNT,
      fieldNamePattern: /bank.?account|account.?number|routing/i,
      valuePattern: /^\d{7,17}$/,
      severity: 'high',
      description: 'Bank account numbers should not be included in patient data'
    },
    {
      type: PHIPAViolationType.DRIVERS_LICENSE,
      fieldNamePattern: /driver.?license|dl.?number|licence/i,
      severity: 'high',
      description: 'Driver\'s license numbers are personally identifiable and should be encrypted'
    },
    {
      type: PHIPAViolationType.PASSPORT,
      fieldNamePattern: /passport/i,
      valuePattern: /^[A-Z]{1,2}\d{6,9}$/,
      severity: 'high',
      description: 'Passport numbers must be protected as sensitive identifiers'
    },
    {
      type: PHIPAViolationType.HEALTH_CARD,
      fieldNamePattern: /health.?card|ohip|medicare.?number|provincial.?health/i,
      valuePattern: /^\d{10}$/,
      severity: 'critical',
      description: 'Health card numbers are highly sensitive and must be encrypted'
    },
    {
      type: PHIPAViolationType.IP_ADDRESS,
      fieldNamePattern: /ip.?address|ip.?addr/i,
      valuePattern: /^(?:\d{1,3}\.){3}\d{1,3}$/,
      severity: 'medium',
      description: 'IP addresses can be used to identify individuals'
    },
    {
      type: PHIPAViolationType.BIOMETRIC_DATA,
      fieldNamePattern: /fingerprint|retina|biometric|facial.?recognition/i,
      severity: 'critical',
      description: 'Biometric data requires special encryption and handling'
    },
    {
      type: PHIPAViolationType.GENETIC_DATA,
      fieldNamePattern: /genetic|dna|genome|hereditary/i,
      severity: 'critical',
      description: 'Genetic information is highly sensitive personal health data'
    }
  ];

  constructor() {}

  /**
   * Validates JSON data against PHIPA (Personal Health Information Protection Act) requirements
   * @param data - The JSON data to validate
   * @returns PHIPAValidationResult with violations and warnings
   */
  validateData(data: any): PHIPAValidationResult {
    const violations: PHIPAViolation[] = [];
    const warnings: PHIPAWarning[] = [];

    // Scan the data recursively
    this.scanObject(data, '', violations, warnings);

    const isCompliant = violations.length === 0;
    const summary = this.generateSummary(violations, warnings);

    return {
      isCompliant,
      violations,
      warnings,
      scanDate: new Date(),
      summary
    };
  }

  private scanObject(
    obj: any,
    path: string,
    violations: PHIPAViolation[],
    warnings: PHIPAWarning[]
  ): void {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.scanObject(item, `${path}[${index}]`, violations, warnings);
      });
      return;
    }

    if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        // Check field name against patterns
        this.checkFieldName(key, value, fullPath, violations);

        // Check for common sensitive data patterns
        this.checkValuePatterns(key, value, fullPath, violations);

        // Additional checks for specific scenarios
        this.checkDateOfBirth(key, value, fullPath, warnings);
        this.checkPostalCode(key, value, fullPath, warnings);
        this.checkEmailPhone(key, value, fullPath, warnings);

        // Recurse for nested objects
        if (typeof value === 'object') {
          this.scanObject(value, fullPath, violations, warnings);
        }
      });
    }
  }

  private checkFieldName(
    fieldName: string,
    value: any,
    path: string,
    violations: PHIPAViolation[]
  ): void {
    for (const pattern of this.sensitivePatterns) {
      if (pattern.fieldNamePattern.test(fieldName)) {
        // Check if value also matches pattern (if value pattern exists)
        if (pattern.valuePattern && typeof value === 'string') {
          if (pattern.valuePattern.test(value)) {
            violations.push({
              field: path,
              violationType: pattern.type,
              value: this.maskValue(value),
              severity: pattern.severity,
              description: pattern.description,
              recommendation: this.getRecommendation(pattern.type)
            });
          }
        } else {
          // Field name matches, add violation
          violations.push({
            field: path,
            violationType: pattern.type,
            value: typeof value === 'string' ? this.maskValue(value) : '[REDACTED]',
            severity: pattern.severity,
            description: pattern.description,
            recommendation: this.getRecommendation(pattern.type)
          });
        }
      }
    }
  }

  private checkValuePatterns(
    fieldName: string,
    value: any,
    path: string,
    violations: PHIPAViolation[]
  ): void {
    if (typeof value !== 'string') {
      return;
    }

    // Check for SIN pattern (Canadian)
    if (/^\d{3}[-\s]?\d{3}[-\s]?\d{3}$/.test(value)) {
      if (!fieldName.toLowerCase().includes('sin')) {
        violations.push({
          field: path,
          violationType: PHIPAViolationType.SIN,
          value: this.maskValue(value),
          severity: 'critical',
          description: 'Possible Social Insurance Number detected in field value',
          recommendation: 'Remove or encrypt SIN data'
        });
      }
    }

    // Check for credit card pattern
    if (/^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/.test(value)) {
      violations.push({
        field: path,
        violationType: PHIPAViolationType.CREDIT_CARD,
        value: this.maskValue(value),
        severity: 'critical',
        description: 'Possible credit card number detected',
        recommendation: 'Credit card data should not be stored in patient records'
      });
    }
  }

  private checkDateOfBirth(
    fieldName: string,
    value: any,
    path: string,
    warnings: PHIPAWarning[]
  ): void {
    if (/birth.?date|dob|date.?of.?birth/i.test(fieldName)) {
      if (typeof value === 'string') {
        // Full date of birth with day may be too specific
        if (/^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          warnings.push({
            field: path,
            warningType: 'Date Precision',
            description: 'Full date of birth may be too specific. Consider using year and month only for de-identification.'
          });
        }
      }
    }
  }

  private checkPostalCode(
    fieldName: string,
    value: any,
    path: string,
    warnings: PHIPAWarning[]
  ): void {
    if (/postal.?code|zip.?code/i.test(fieldName)) {
      if (typeof value === 'string') {
        // Full Canadian postal code (too specific for de-identification)
        if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(value)) {
          warnings.push({
            field: path,
            warningType: 'Geographic Precision',
            description: 'Full postal code may be too specific. Consider using first 3 characters only (FSA) for de-identification.'
          });
        }
      }
    }
  }

  private checkEmailPhone(
    fieldName: string,
    value: any,
    path: string,
    warnings: PHIPAWarning[]
  ): void {
    if (/email/i.test(fieldName) && typeof value === 'string') {
      if (/@/.test(value)) {
        warnings.push({
          field: path,
          warningType: 'Contact Information',
          description: 'Email addresses should be encrypted in transit and at rest. Ensure proper security measures.'
        });
      }
    }

    if (/phone|mobile|tel/i.test(fieldName) && typeof value === 'string') {
      if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(value)) {
        warnings.push({
          field: path,
          warningType: 'Contact Information',
          description: 'Phone numbers should be encrypted. Consider partial masking for display purposes.'
        });
      }
    }
  }

  private maskValue(value: string): string {
    if (value.length <= 4) {
      return '****';
    }
    const visible = Math.min(4, value.length);
    return value.slice(0, visible) + '*'.repeat(value.length - visible);
  }

  private getRecommendation(type: PHIPAViolationType): string {
    const recommendations: Record<string, string> = {
      [PHIPAViolationType.SIN]: 'Remove SIN from patient records or use tokenization/encryption',
      [PHIPAViolationType.CREDIT_CARD]: 'Remove credit card information from health records',
      [PHIPAViolationType.BANK_ACCOUNT]: 'Use a separate billing system for financial data',
      [PHIPAViolationType.DRIVERS_LICENSE]: 'Use alternate patient identifiers or encrypt',
      [PHIPAViolationType.PASSPORT]: 'Use alternate identifiers and encrypt if required',
      [PHIPAViolationType.HEALTH_CARD]: 'Encrypt health card numbers and use tokenization',
      [PHIPAViolationType.IP_ADDRESS]: 'Anonymize or remove IP addresses from patient data',
      [PHIPAViolationType.BIOMETRIC_DATA]: 'Use specialized biometric encryption and secure storage',
      [PHIPAViolationType.GENETIC_DATA]: 'Apply highest level of encryption and access controls',
      [PHIPAViolationType.CUSTOM_SENSITIVE]: 'Review and encrypt sensitive fields'
    };

    return recommendations[type] || 'Encrypt or remove sensitive data';
  }

  private generateSummary(violations: PHIPAViolation[], warnings: PHIPAWarning[]): string {
    if (violations.length === 0 && warnings.length === 0) {
      return 'PHIPA Compliant: No violations or warnings detected.';
    }

    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;

    let summary = '';

    if (violations.length > 0) {
      summary += `NON-COMPLIANT: ${violations.length} violation(s) detected. `;
      if (criticalCount > 0) {
        summary += `${criticalCount} critical issue(s) require immediate attention. `;
      }
      if (highCount > 0) {
        summary += `${highCount} high-priority issue(s) found. `;
      }
    }

    if (warnings.length > 0) {
      summary += `${warnings.length} warning(s) for review.`;
    }

    return summary.trim();
  }
}
