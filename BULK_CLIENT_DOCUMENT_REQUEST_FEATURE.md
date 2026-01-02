# Bulk Client Document Request Feature

## 📋 Overview
Fitur untuk memudahkan worker dalam meminta banyak dokumen dari client sekaligus menggunakan Excel/CSV upload, sebagai alternatif dari input manual satu per satu.

## ✨ Features

### 1. Download Template Excel
- Worker dapat download template CSV dengan kolom:
  - `Document Name` (required)
  - `Description` (optional)
- Template sudah include 3 contoh data untuk panduan

### 2. Bulk Upload via Excel/CSV
- Support format: `.csv`, `.xls`, `.xlsx`
- Max file size: 2MB
- Automatic parsing dan validasi
- Import semua dokumen sekaligus ke form

### 3. Manual Input (Existing)
- Tetap tersedia untuk kebutuhan input sedikit dokumen
- Klik "+ Add Document Request" untuk tambah satu per satu

## 🎯 Use Cases

### Scenario 1: Audit dengan Puluhan Dokumen
Worker perlu request 50+ dokumen untuk audit perusahaan besar:
1. Download template
2. Isi di Excel dengan list semua dokumen
3. Upload file Excel
4. Semua dokumen langsung masuk ke form!

### Scenario 2: Dokumen Standar Berulang
Template bisa disimpan dan digunakan ulang untuk project serupa.

### Scenario 3: Quick Addition
Butuh tambah 1-3 dokumen saja? Pakai manual input lebih cepat.

## 🔧 Technical Implementation

### Backend (Laravel)

#### New Routes
```php
// routes/web.php
Route::get('/client-documents/template', [CompanyController::class, 'downloadClientDocumentTemplate'])
    ->name('client-documents.template');

Route::post('/client-documents/parse-excel', [CompanyController::class, 'parseClientDocumentExcel'])
    ->name('client-documents.parse-excel');
```

#### New Controller Methods
```php
// app/Http/Controllers/Company/CompanyController.php

public function downloadClientDocumentTemplate()
// Returns CSV file with headers and example data

public function parseClientDocumentExcel(Request $request)
// Parses uploaded CSV/Excel file and returns JSON with documents array
```

### Frontend (React + TypeScript)

#### New State Variables
```typescript
const [isUploadingExcel, setIsUploadingExcel] = useState(false);
const [excelError, setExcelError] = useState<string | null>(null);
```

#### New Handler Functions
```typescript
handleDownloadTemplate() // Download CSV template
handleExcelUpload(event) // Parse and import Excel data
```

#### UI Components
- Blue info box dengan:
  - "Download Template" button
  - "Upload Excel" button (dengan file input hidden)
  - Error message display
  - Loading state saat upload
- Manual input section tetap ada di bawah

## 📊 Data Flow

```
┌─────────────┐
│   Worker    │
└──────┬──────┘
       │
       │ 1. Click "Download Template"
       ▼
┌─────────────────┐
│ CompanyController│
│ downloadTemplate│
└──────┬──────────┘
       │
       │ 2. Returns CSV file
       ▼
┌─────────────┐
│   Worker    │
│ fills Excel │
└──────┬──────┘
       │
       │ 3. Upload filled Excel
       ▼
┌─────────────────┐
│ CompanyController│
│ parseExcel      │
└──────┬──────────┘
       │
       │ 4. Parse CSV/Excel
       │ 5. Return JSON {documents: [...]}
       ▼
┌─────────────┐
│  Frontend   │
│ adds to form│
└──────┬──────┘
       │
       │ 6. Submit form as usual
       ▼
┌─────────────────┐
│ updateTaskStatus│
│ creates ClientDoc│
└─────────────────┘
```

## 🎨 UI/UX

### Visual Design
- **Blue info box**: Bulk upload section dengan visual hierarchy jelas
- **Icons**: Download & Upload icons untuk clarity
- **Loading state**: "Uploading..." text saat processing
- **Error handling**: Red error message jika file invalid
- **Success feedback**: Toast notification dengan jumlah dokumen imported

### User Flow
1. Open task modal di "Request Documents from Client" section
2. See 2 options:
   - **Bulk Upload** (for many docs) - Featured in blue box
   - **Manual Input** (for few docs) - Below with "+ Add" button
3. Choose based on need:
   - Many docs (10+) → Use Excel upload
   - Few docs (1-5) → Use manual input

## 🧪 Testing Scenarios

### Test Case 1: Valid Excel Upload
1. Download template
2. Add 20 document entries
3. Upload file
4. ✅ All 20 documents should appear in form

### Test Case 2: Invalid File Format
1. Upload .pdf file
2. ✅ Error message: "Please upload a valid CSV or Excel file"

### Test Case 3: Mixed Manual + Excel
1. Manually add 3 documents
2. Upload Excel with 10 documents
3. ✅ Form should have 13 total documents

### Test Case 4: Empty Rows
1. Excel has some empty rows between data
2. ✅ Empty rows should be skipped

### Test Case 5: Large File
1. Upload Excel with 100+ documents
2. ✅ Should import successfully
3. ✅ Toast shows correct count

## 📝 CSV Template Format

```csv
Document Name,Description
NPWP Perusahaan,Salinan NPWP yang masih berlaku
KTP Direktur,KTP Direktur Utama (scan berwarna)
Akta Pendirian,Akta pendirian perusahaan
```

## 🔒 Security Considerations

1. **File Size Limit**: Max 2MB untuk prevent abuse
2. **File Type Validation**: Only CSV/Excel formats allowed
3. **CSRF Protection**: Uses Laravel's CSRF token
4. **Data Sanitization**: `trim()` applied to all inputs
5. **Empty Row Handling**: Skip rows dengan document name kosong

## 🚀 Future Enhancements

Potential improvements:
1. Save templates untuk reuse
2. Excel preview sebelum import
3. Validation rules (max length, required fields)
4. Batch edit uploaded documents
5. Export current document list ke Excel

## 📅 Implementation Date
December 23, 2025

## 👨‍💻 Modified Files

### Backend
- `app/Http/Controllers/Company/CompanyController.php` (added 2 methods)
- `routes/web.php` (added 2 routes)

### Frontend
- `resources/js/Pages/Company/Tasks/TaskDetail.tsx` (added bulk upload UI & handlers)

## ✅ Status
**COMPLETED** - Ready for testing and production use
