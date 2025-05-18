# Table Builder - Interactive Tables and Grids

A powerful Angular application that dynamically generates sortable, filterable HTML tables from JSON data uploads. This project demonstrates advanced patterns in dynamic component rendering, data handling, and performance optimization.

## Features

- **JSON File Upload**: Drag-and-drop or browse to upload JSON files
- **Automatic Table Generation**: Intelligently parses JSON data and creates tables
- **Smart Type Detection**: Automatically detects and formats data types (string, number, boolean, date)
- **Sortable Columns**: Click column headers to sort data ascending/descending
- **Powerful Filtering**: Real-time search across all columns
- **Pagination**: Handle large datasets with configurable page sizes (10, 25, 50, 100)
- **Export Functionality**: Export filtered data to JSON or CSV formats
- **Responsive Design**: Mobile-friendly layout with Angular Material
- **Performance Optimized**: Efficient rendering for large datasets

## Technology Stack

- **Angular 21** - Latest Angular framework with standalone components
- **Angular Material** - Professional UI components
- **TypeScript 5.9** - Type-safe development
- **RxJS** - Reactive programming with observables
- **SCSS** - Advanced styling with Sass

## Prerequisites

- Node.js (v18 or higher)

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:4200/`

## Usage

### Quick Start

1. **Upload a JSON File**:
   - Drag and drop a JSON file into the upload area, or
   - Click "Choose File" to browse your files

2. **View Your Data**:
   - The table will automatically generate with sortable columns
   - Use the search box to filter data across all columns
   - Click column headers to sort

3. **Export Your Data**:
   - Click "Export JSON" to download filtered data as JSON
   - Click "Export CSV" to download as CSV

### Supported JSON Formats

The application intelligently handles multiple JSON structures:

**Array Format** (Recommended):
```json
[
  { "name": "Item 1", "value": 100 },
  { "name": "Item 2", "value": 200 }
]
```

**Object with Array Property**:
```json
{
  "data": [
    { "name": "Item 1", "value": 100 }
  ]
}
```

**Single Object**:
```json
{
  "name": "Item 1",
  "value": 100
}
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── file-upload/          # File upload component
│   │   │   ├── file-upload.component.ts
│   │   │   ├── file-upload.component.html
│   │   │   └── file-upload.component.scss
│   │   └── dynamic-table/        # Dynamic table component
│   │       ├── dynamic-table.component.ts
│   │       ├── dynamic-table.component.html
│   │       └── dynamic-table.component.scss
│   ├── models/
│   │   └── table-data.model.ts   # Data models
│   ├── services/
│   │   └── table-data.service.ts # Data processing service
│   ├── app.ts                    # Main app component
│   ├── app.html
│   └── app.scss
├── styles.scss                   # Global styles & Material theme
└── main.ts                       # Application bootstrap
```

## Key Features Explained

### Dynamic Component Rendering

Instead of hardcoding table structures, this app dynamically generates components based on data:

```typescript
// Automatically detects column types
private detectType(data: any[], key: string): 'string' | 'number' | 'boolean' | 'date'

// Generates columns dynamically
const columns: TableColumn[] = Array.from(allKeys).map(key => ({
  key,
  label: this.formatLabel(key),
  type: this.detectType(data, key)
}));
```

### Performance Optimization

- **Virtual Scrolling**: Material table with pagination for large datasets
- **Change Detection**: OnPush strategy where applicable
- **Lazy Loading**: Modules loaded as needed
- **Debounced Filtering**: Efficient search implementation

### Angular Material Integration

Utilizes professional Material Design components:
- `MatTable` - Data table with sorting
- `MatSort` - Column sorting
- `MatPaginator` - Pagination controls
- `MatFormField` - Filter input
- `MatButton` - Action buttons
- `MatIcon` - Icons throughout
- `MatToolbar` - Application header
- `MatCard` - Content containers

## Building

To build the project run:

```bash
ng build
```

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests

## Learning Outcomes

This project teaches:

1. **Dynamic Component Rendering** - Generate UI based on data structure
2. **Data Type Detection** - Intelligent parsing and formatting
3. **Performance Optimization** - Handle large datasets efficiently
4. **Angular Material** - Professional UI component library
5. **Reactive Programming** - RxJS observables and subjects
6. **File Processing** - Handle file uploads and parsing
7. **Data Export** - Generate JSON and CSV files
8. **Responsive Design** - Mobile-first approach


## Contributing

Feel free to fork this project and add your own enhancements:
- Add more data type detections
- Implement column filtering
- Add chart visualizations
- Support more file formats (CSV, Excel)

## License

MIT License - feel free to use this project for learning and commercial purposes.

## Future Enhancements

- [ ] Column-specific filters
- [ ] Export to Excel
- [ ] Import from CSV
- [ ] Data visualization charts
- [ ] Custom column ordering
- [ ] Save/load table configurations
- [ ] Theme customization
- [ ] Print functionality



