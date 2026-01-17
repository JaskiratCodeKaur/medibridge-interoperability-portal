// PHIPA Compliance Models
export interface PHIPAValidationResult {
  isCompliant: boolean;
  violations: PHIPAViolation[];
  warnings: PHIPAWarning[];
  scanDate: Date;
  summary: string;
}

export interface PHIPAViolation {
  field: string;
  violationType: PHIPAViolationType;
  value?: string; // Masked value
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface PHIPAWarning {
  field: string;
  warningType: string;
  description: string;
}

export enum PHIPAViolationType {
  SIN = 'Social Insurance Number (SIN)',
  CREDIT_CARD = 'Credit Card Number',
  BANK_ACCOUNT = 'Bank Account Number',
  DRIVERS_LICENSE = 'Driver\'s License',
  PASSPORT = 'Passport Number',
  HEALTH_CARD = 'Health Card Number',
  EMAIL_UNENCRYPTED = 'Unencrypted Email Address',
  PHONE_UNMASKED = 'Unmasked Phone Number',
  DATE_OF_BIRTH_FULL = 'Full Date of Birth (Should be Partial)',
  POSTAL_CODE_FULL = 'Full Postal Code (Too Specific)',
  IP_ADDRESS = 'IP Address',
  BIOMETRIC_DATA = 'Biometric Data',
  GENETIC_DATA = 'Genetic Information',
  CUSTOM_SENSITIVE = 'Custom Sensitive Field'
}

// Sensitive field detection patterns
export interface SensitiveFieldPattern {
  type: PHIPAViolationType;
  fieldNamePattern: RegExp;
  valuePattern?: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}
