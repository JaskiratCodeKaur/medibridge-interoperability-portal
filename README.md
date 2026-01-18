# MediBridge Interoperability Portal

A comprehensive healthcare data interoperability platform built with Angular 21 that transforms clinical data into HL7 FHIR R4 compliant formats while ensuring compliance with privacy regulations including PHIPA (Personal Health Information Protection Act).

## Overview

MediBridge streamlines healthcare data integration by providing intelligent conversion of patient data to industry-standard FHIR resources, automated privacy compliance validation, and real-time data quality assessment. Designed for healthcare organizations requiring seamless interoperability with existing eHealth systems.

## Key Features

### FHIR R4 Conversion
- **Intelligent Field Mapping**: Automatically maps diverse patient data formats to HL7 FHIR R4 Patient resources
- **Multi-Format Support**: Handles various JSON structures with smart data extraction
- **Complete Resource Coverage**: Supports identifiers, names, telecom, addresses, demographics, and more
- **Conversion Audit Trail**: Detailed mapping logs showing field transformations and data sources

### PHIPA Compliance Validation
- **Privacy Assessment**: Real-time validation against Ontario PHIPA requirements
- **Consent Management**: Tracks and validates patient consent status
- **Data Minimization**: Identifies unnecessary PHI collection
- **Security Compliance**: Validates encryption and access control requirements
- **Violation Reporting**: Comprehensive reporting of privacy issues with remediation guidance

### Data Quality & Validation
- **Quality Scoring**: Automated assessment of data completeness and accuracy (0-100 scale)
- **Field Validation**: Checks for required fields, format compliance, and data integrity
- **Interactive Visualization**: Material Design interface for reviewing FHIR resources
- **Export Capabilities**: Download validated FHIR JSON for system integration

### User Experience
- **Drag-and-Drop Upload**: Intuitive file upload with JSON validation
- **Real-Time Processing**: Instant conversion and validation feedback
- **Tabbed Interface**: Organized views for FHIR data and compliance results
- **Responsive Design**: Healthcare-themed UI optimized for desktop and tablet

## Technology Stack

- **Angular 21** - Modern framework with standalone components and signals
- **TypeScript 5.9** - Type-safe development with strict mode
- **Angular Material** - Professional healthcare-themed UI components
- **RxJS** - Reactive data processing with observables
- **HL7 FHIR R4** - Healthcare interoperability standard
- **IHE Standards** - Integration Healthcare Enterprise compliance
- **SCSS** - Advanced styling with healthcare color scheme

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JaskiratCodeKaur/medibridge-interoperability-portal.git
cd medibridge-interoperability-portal
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200/`

## Usage

### Converting Patient Data to FHIR

1. **Upload Patient Data**:
   - Drag and drop a JSON file containing patient information, or
   - Click "Choose File" to browse your files
   - The file will be validated automatically

2. **Review FHIR Conversion**:
   - Switch to the "FHIR Data" tab to view the converted FHIR R4 Patient resource
   - Examine the detailed mapping log showing field transformations
   - Check the data quality score and completeness metrics

3. **Assess Privacy Compliance**:
   - Navigate to the "Compliance" tab to view PHIPA validation results
   - Review consent status, security measures, and data minimization practices
   - Address any identified violations with provided remediation guidance

4. **Export Results**:
   - Click "Export JSON" to download the FHIR-compliant patient resource
   - Use the exported data for integration with EHR systems or FHIR servers

### Supported JSON Formats

MediBridge intelligently handles diverse patient data structures:

**Standard Patient Format**:
```json
{
  "patientId": "P12345",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-05-15",
  "gender": "male",
  "email": "john.doe@example.com",
  "phone": "555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M5H 2N2"
  }
}
```

**Alternate Format with Arrays**:
```json
{
  "id": "12345",
  "name": {
    "given": ["John", "Paul"],
    "family": "Doe"
  },
  "telecom": [
    { "system": "email", "value": "john.doe@example.com" }
  ]
}
```

**Batch Processing**:
```json
{
  "patients": [
    { "patientId": "P001", "firstName": "Jane", "lastName": "Smith" },
    { "patientId": "P002", "firstName": "Bob", "lastName": "Johnson" }
  ]
}
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── medibridge/                    # Main portal component
│   │   │   ├── medibridge.component.ts
│   │   │   ├── medibridge.component.html
│   │   │   └── medibridge.component.scss
│   │   ├── fhir-display/                  # FHIR resource visualization
│   │   │   ├── fhir-display.component.ts
│   │   │   ├── fhir-display.component.html
│   │   │   └── fhir-display.component.scss
│   │   ├── compliance-display/            # PHIPA compliance reporting
│   │   │   ├── compliance-display.component.ts
│   │   │   ├── compliance-display.component.html
│   │   │   └── compliance-display.component.scss
│   │   └── file-upload/                   # Legacy file upload component
│   │       ├── file-upload.component.ts
│   │       ├── file-upload.component.html
│   │       └── file-upload.component.scss
│   ├── models/
│   │   ├── fhir.model.ts                  # FHIR R4 interfaces
│   │   ├── phipa.model.ts                 # PHIPA compliance models
│   │   └── table-data.model.ts            # Data structure models
│   ├── services/
│   │   ├── fhir-converter.service.ts      # JSON to FHIR conversion
│   │   ├── phipa-validation.service.ts    # Privacy compliance validation
│   │   ├── interoperability.service.ts    # Orchestration service
│   │   └── table-data.service.ts          # Legacy data service
│   ├── app.ts                             # Root component
│   ├── app.html                           # Root template
│   ├── app.scss                           # Global styles
│   └── app.config.ts                      # App configuration
├── sample-data/                           # Test data files
│   ├── patient-compliant.json             # Valid PHIPA-compliant data
│   ├── patient-with-violations.json       # Data with privacy issues
│   ├── patient-alternate-format.json      # Different JSON structure
│   └── patients-batch.json                # Multiple patient records
└── index.html
```

## Standards Compliance

### HL7 FHIR R4
- Full implementation of Patient resource structure
- Support for Identifier, HumanName, ContactPoint, Address resources
- CodeableConcept and Coding for standardized terminology
- Period tracking for temporal data validity

### IHE Integration Profiles
- Patient Demographics Query (PDQ)
- Cross-Enterprise Document Sharing (XDS)
- Patient Identifier Cross-referencing (PIX)

### PHIPA Requirements
- Consent management and tracking
- Data minimization validation
- Security and encryption compliance
- Access control verification
- Breach notification readiness

## Architecture

### Service Layer

**FhirConverterService**
- Converts generic JSON to FHIR R4 Patient resources
- Intelligent field mapping with multiple naming convention support
- UUID generation for FHIR identifiers
- Comprehensive logging of data transformations

**PhipaValidationService**
- Real-time privacy compliance assessment
- Consent status validation
- Security measure verification
- Data minimization checks
- Violation detection and reporting

**InteroperabilityService**
- Orchestrates conversion and validation workflows
- Data quality scoring algorithm
- Error handling and recovery
- Results aggregation

### Component Architecture

**MediBridgeComponent**
- Main container with file upload handling
- Tab-based navigation between views
- Real-time processing feedback
- Error notification system

**FhirDisplayComponent**
- FHIR resource visualization with JSON formatting
- Interactive mapping log explorer
- Field-level transformation details
- Export functionality

**ComplianceDisplayComponent**
- Privacy compliance dashboard
- Violation severity indicators
- Remediation guidance
- Consent status tracking

## Data Quality Scoring

MediBridge calculates a comprehensive data quality score (0-100) based on:

- **Completeness (40%)**: Presence of required and recommended fields
- **Format Validity (30%)**: Proper formatting of dates, phones, emails, postal codes
- **Consistency (20%)**: Data coherence and logical validation
- **Standardization (10%)**: Use of standard terminologies and codes

## Security & Privacy

- Client-side processing - no data transmitted to external servers
- JSON validation prevents malicious file uploads
- Compliance validation aligns with PHIPA, HIPAA principles
- Export functionality for secure data transfer

## Sample Data

Test files are provided in the `sample-data/` directory:

- `patient-compliant.json` - Fully compliant patient record
- `patient-with-violations.json` - Record with PHIPA violations for testing
- `patient-alternate-format.json` - Different JSON structure demonstration
- `patients-batch.json` - Multiple patient records for batch processing

## License

This project is for educational and demonstration purposes.
