import { Injectable } from '@angular/core';
import {
  FHIRPatient,
  FHIRHumanName,
  FHIRContactPoint,
  FHIRAddress,
  FHIRIdentifier,
  FHIRConversionResult
} from '../models/fhir.model';

@Injectable({
  providedIn: 'root'
})
export class FhirConverterService {
  constructor() {}

  /**
   * Converts generic JSON patient data to FHIR R4 Patient resource
   * @param data - Generic patient data in JSON format
   * @returns FHIRConversionResult with the FHIR Patient resource
   */
  convertToFHIRPatient(data: any): FHIRConversionResult {
    const mappingLog: string[] = [];
    const errors: string[] = [];

    try {
      // Handle array input (take first item if array)
      let patientData = Array.isArray(data) ? data[0] : data;

      if (!patientData || typeof patientData !== 'object') {
        throw new Error('Invalid input: expected object or array of objects');
      }

      const fhirPatient: FHIRPatient = {
        resourceType: 'Patient',
        id: this.extractId(patientData, mappingLog),
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
        }
      };

      // Extract and map name
      const name = this.extractName(patientData, mappingLog);
      if (name) {
        fhirPatient.name = [name];
      }

      // Extract and map identifiers
      const identifiers = this.extractIdentifiers(patientData, mappingLog);
      if (identifiers.length > 0) {
        fhirPatient.identifier = identifiers;
      }

      // Extract gender
      const gender = this.extractGender(patientData, mappingLog);
      if (gender) {
        fhirPatient.gender = gender;
      }

      // Extract birth date
      const birthDate = this.extractBirthDate(patientData, mappingLog);
      if (birthDate) {
        fhirPatient.birthDate = birthDate;
      }

      // Extract contact info (phone, email)
      const telecom = this.extractTelecom(patientData, mappingLog);
      if (telecom.length > 0) {
        fhirPatient.telecom = telecom;
      }

      // Extract address
      const address = this.extractAddress(patientData, mappingLog);
      if (address.length > 0) {
        fhirPatient.address = address;
      }

      // Extract active status
      const active = this.extractActive(patientData, mappingLog);
      if (active !== undefined) {
        fhirPatient.active = active;
      }

      mappingLog.push('✓ Successfully converted to FHIR R4 Patient resource');

      return {
        success: true,
        fhirResource: fhirPatient,
        originalData: patientData,
        mappingLog,
        errors
      };
    } catch (error) {
      errors.push(`Conversion failed: ${(error as Error).message}`);
      return {
        success: false,
        originalData: data,
        mappingLog,
        errors
      };
    }
  }

  private extractId(data: any, log: string[]): string {
    const possibleFields = ['id', 'patientId', 'patient_id', 'mrn', 'medicalRecordNumber'];

    for (const field of possibleFields) {
      if (data[field]) {
        log.push(`Mapped ${field} → Patient.id`);
        return String(data[field]);
      }
    }

    // Generate UUID if no ID found
    const generatedId = this.generateUUID();
    log.push(`Generated UUID for Patient.id: ${generatedId}`);
    return generatedId;
  }

  private extractName(data: any, log: string[]): FHIRHumanName | null {
    const name: FHIRHumanName = {
      use: 'official'
    };

    // Check for structured name fields
    if (data.firstName || data.first_name || data.given) {
      const givenName = data.firstName || data.first_name || data.given;
      name.given = Array.isArray(givenName) ? givenName : [givenName];
      log.push(`Mapped firstName/first_name/given → Patient.name.given`);
    }

    if (data.lastName || data.last_name || data.family) {
      name.family = data.lastName || data.last_name || data.family;
      log.push(`Mapped lastName/last_name/family → Patient.name.family`);
    }

    if (data.middleName || data.middle_name) {
      const middleName = data.middleName || data.middle_name;
      name.given = name.given || [];
      name.given.push(middleName);
      log.push(`Mapped middleName/middle_name → Patient.name.given`);
    }

    if (data.prefix) {
      name.prefix = Array.isArray(data.prefix) ? data.prefix : [data.prefix];
      log.push(`Mapped prefix → Patient.name.prefix`);
    }

    if (data.suffix) {
      name.suffix = Array.isArray(data.suffix) ? data.suffix : [data.suffix];
      log.push(`Mapped suffix → Patient.name.suffix`);
    }

    // Check for full name field
    if (data.name || data.fullName || data.full_name) {
      const fullName = data.name || data.fullName || data.full_name;
      const parts = fullName.split(' ');
      if (parts.length > 1) {
        name.given = [parts[0]];
        name.family = parts[parts.length - 1];
        if (parts.length > 2) {
          name.given.push(...parts.slice(1, -1));
        }
        log.push(`Parsed fullName → Patient.name (given + family)`);
      } else {
        name.text = fullName;
        log.push(`Mapped fullName → Patient.name.text`);
      }
    }

    // Return null if no name data found
    if (!name.given && !name.family && !name.text) {
      log.push(`⚠ No name data found in input`);
      return null;
    }

    return name;
  }

  private extractIdentifiers(data: any, log: string[]): FHIRIdentifier[] {
    const identifiers: FHIRIdentifier[] = [];

    // Medical Record Number
    if (data.mrn || data.medicalRecordNumber || data.medical_record_number) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }]
        },
        value: String(data.mrn || data.medicalRecordNumber || data.medical_record_number)
      });
      log.push(`Mapped mrn → Patient.identifier (MR)`);
    }

    // Health Card
    if (data.healthCard || data.health_card || data.ohip) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'HC',
            display: 'Health Card Number'
          }]
        },
        system: 'urn:oid:2.16.840.1.113883.4.56', // Canadian health card
        value: String(data.healthCard || data.health_card || data.ohip)
      });
      log.push(`Mapped healthCard → Patient.identifier (HC)`);
    }

    // Passport
    if (data.passport || data.passportNumber) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'PPN',
            display: 'Passport Number'
          }]
        },
        value: String(data.passport || data.passportNumber)
      });
      log.push(`Mapped passport → Patient.identifier (PPN)`);
    }

    return identifiers;
  }

  private extractGender(data: any, log: string[]): 'male' | 'female' | 'other' | 'unknown' | undefined {
    const genderField = data.gender || data.sex;

    if (!genderField) {
      return undefined;
    }

    const genderStr = String(genderField).toLowerCase();

    if (genderStr.includes('male') && !genderStr.includes('female')) {
      log.push(`Mapped gender → Patient.gender (male)`);
      return 'male';
    }
    if (genderStr.includes('female')) {
      log.push(`Mapped gender → Patient.gender (female)`);
      return 'female';
    }
    if (genderStr.includes('other') || genderStr.includes('non-binary')) {
      log.push(`Mapped gender → Patient.gender (other)`);
      return 'other';
    }

    log.push(`Mapped gender → Patient.gender (unknown)`);
    return 'unknown';
  }

  private extractBirthDate(data: any, log: string[]): string | undefined {
    const dateFields = ['birthDate', 'birth_date', 'dob', 'dateOfBirth', 'date_of_birth'];

    for (const field of dateFields) {
      if (data[field]) {
        const dateStr = this.formatDate(data[field]);
        if (dateStr) {
          log.push(`Mapped ${field} → Patient.birthDate`);
          return dateStr;
        }
      }
    }

    return undefined;
  }

  private extractTelecom(data: any, log: string[]): FHIRContactPoint[] {
    const telecom: FHIRContactPoint[] = [];

    // Phone numbers
    const phoneFields = ['phone', 'phoneNumber', 'phone_number', 'mobile', 'tel', 'telephone'];
    for (const field of phoneFields) {
      if (data[field]) {
        telecom.push({
          system: 'phone',
          value: String(data[field]),
          use: field.includes('mobile') ? 'mobile' : 'home'
        });
        log.push(`Mapped ${field} → Patient.telecom (phone)`);
        break; // Take first phone number found
      }
    }

    // Email
    if (data.email || data.emailAddress || data.email_address) {
      telecom.push({
        system: 'email',
        value: String(data.email || data.emailAddress || data.email_address),
        use: 'home'
      });
      log.push(`Mapped email → Patient.telecom (email)`);
    }

    return telecom;
  }

  private extractAddress(data: any, log: string[]): FHIRAddress[] {
    const addresses: FHIRAddress[] = [];

    // Check if there's an address object
    const addressData = data.address || data;

    const address: FHIRAddress = {
      use: 'home',
      type: 'physical'
    };

    let hasAddressData = false;

    if (addressData.street || addressData.streetAddress || addressData.street_address || addressData.line) {
      const street = addressData.street || addressData.streetAddress || addressData.street_address || addressData.line;
      address.line = Array.isArray(street) ? street : [street];
      hasAddressData = true;
      log.push(`Mapped street → Patient.address.line`);
    }

    if (addressData.city) {
      address.city = addressData.city;
      hasAddressData = true;
      log.push(`Mapped city → Patient.address.city`);
    }

    if (addressData.state || addressData.province) {
      address.state = addressData.state || addressData.province;
      hasAddressData = true;
      log.push(`Mapped state/province → Patient.address.state`);
    }

    if (addressData.postalCode || addressData.postal_code || addressData.zip || addressData.zipCode) {
      address.postalCode = addressData.postalCode || addressData.postal_code || addressData.zip || addressData.zipCode;
      hasAddressData = true;
      log.push(`Mapped postalCode → Patient.address.postalCode`);
    }

    if (addressData.country) {
      address.country = addressData.country;
      hasAddressData = true;
      log.push(`Mapped country → Patient.address.country`);
    }

    if (hasAddressData) {
      addresses.push(address);
    }

    return addresses;
  }

  private extractActive(data: any, log: string[]): boolean | undefined {
    const activeFields = ['active', 'isActive', 'is_active', 'status'];

    for (const field of activeFields) {
      if (data[field] !== undefined) {
        const value = data[field];

        if (typeof value === 'boolean') {
          log.push(`Mapped ${field} → Patient.active`);
          return value;
        }

        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (lowerValue === 'active' || lowerValue === 'true' || lowerValue === '1') {
            log.push(`Mapped ${field} → Patient.active (true)`);
            return true;
          }
          if (lowerValue === 'inactive' || lowerValue === 'false' || lowerValue === '0') {
            log.push(`Mapped ${field} → Patient.active (false)`);
            return false;
          }
        }
      }
    }

    return undefined;
  }

  private formatDate(dateInput: any): string | undefined {
    if (!dateInput) return undefined;

    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        return undefined;
      }

      // Return ISO date format (YYYY-MM-DD)
      return date.toISOString().split('T')[0];
    } catch {
      return undefined;
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validates a FHIR Patient resource against basic FHIR rules
   */
  validateFHIRPatient(patient: FHIRPatient): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (patient.resourceType !== 'Patient') {
      errors.push('resourceType must be "Patient"');
    }

    if (!patient.id) {
      errors.push('Patient must have an id');
    }

    if (patient.name && patient.name.length > 0) {
      patient.name.forEach((name: FHIRHumanName, index: number) => {
        if (!name.family && !name.given && !name.text) {
          errors.push(`name[${index}] must have at least family, given, or text`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
