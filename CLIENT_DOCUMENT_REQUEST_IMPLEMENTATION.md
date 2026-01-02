# Client-Side Document Request Implementation

## 🎯 Overview
Implementasi lengkap antarmuka client untuk fitur **Project-Level Document Request**. Client dapat melihat permintaan dokumen dari tim audit dan mengupload dokumen yang diminta.

## ✅ Yang Sudah Diimplementasikan

### 1. TypeScript Interfaces
```typescript
interface ProjectDocumentRequest {
    id: string;
    project_id: string;
    requested_by_user_id: string;
    document_name: string;
    description: string | null;
    status: 'pending' | 'uploaded' | 'completed';
    file_path: string | null;
    uploaded_at: string | null;
    created_at: string;
    updated_at: string;
    requested_by?: {
        id: string;
        name: string;
        email: string;
    };
}
```

### 2. State Management
```typescript
const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
```

**Purpose:**
- `uploadingDocumentId`: Track dokumen mana yang sedang diupload (untuk loading state)
- `uploadErrors`: Menyimpan error message per document request ID

### 3. Upload Handler Function
```typescript
const handleUploadDocument = async (documentRequestId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Ambil file dari input
    const file = event.target.files?.[0];
    if (!file) return;

    // 2. Validasi ukuran file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        setUploadErrors(prev => ({
            ...prev,
            [documentRequestId]: 'File size must be less than 10MB'
        }));
        return;
    }

    // 3. Set loading state
    setUploadingDocumentId(documentRequestId);
    
    // 4. Buat FormData dan kirim ke server
    const formData = new FormData();
    formData.append('file', file);
    
    // 5. POST ke endpoint upload
    const response = await fetch(route('client.document-requests.upload', documentRequestId), {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
    });

    // 6. Handle success/error
    if (response.ok) {
        window.location.reload(); // Reload untuk update UI
    } else {
        // Show error message
    }
}
```

**Features:**
- ✅ File size validation (max 10MB)
- ✅ Loading state per document
- ✅ Error handling dengan user feedback
- ✅ CSRF token protection
- ✅ Auto-reload setelah success

### 4. UI Components

#### A. Section Header dengan Summary
```tsx
<div className="mb-4 flex items-center justify-between">
    <div>
        <h3>📋 Permintaan Dokumen</h3>
        <p>Dokumen yang diminta oleh tim audit ({documentRequests.length} dokumen)</p>
    </div>
    <div className="flex items-center gap-2 text-sm">
        <span className="...yellow...">
            {documentRequests.filter(req => req.status === 'pending').length} Pending
        </span>
        <span className="...blue...">
            {documentRequests.filter(req => req.status === 'uploaded').length} Uploaded
        </span>
        <span className="...green...">
            {documentRequests.filter(req => req.status === 'completed').length} Completed
        </span>
    </div>
</div>
```

**Menampilkan:**
- Total jumlah dokumen requests
- Jumlah per status (Pending, Uploaded, Completed)

#### B. Document Request Cards

**Card Structure:**
```tsx
<div className={`border-2 rounded-lg p-4 ${statusColors}`}>
    {/* Document Name & Status Badge */}
    <div className="flex items-center gap-3">
        <h4>{request.document_name}</h4>
        {/* Status Badge dengan icon */}
    </div>
    
    {/* Description */}
    {request.description && (
        <p className="text-sm text-gray-700">
            {request.description}
        </p>
    )}
    
    {/* Metadata */}
    <div className="flex items-center gap-4 text-xs">
        <span>👤 Diminta oleh: {request.requested_by?.name}</span>
        <span>📅 {formatted_date}</span>
        {request.uploaded_at && (
            <span>✅ Diupload: {formatted_upload_date}</span>
        )}
    </div>
    
    {/* Action Area */}
    {request.status === 'pending' && (
        <label className="cursor-pointer">
            <div className="upload-button">
                {uploading ? 'Uploading...' : '📤 Upload Dokumen'}
            </div>
            <input type="file" onChange={handleUpload} className="hidden" />
        </label>
    )}
</div>
```

**Color Coding by Status:**
- 🟡 **Pending**: Yellow border + background (`border-yellow-200 bg-yellow-50`)
- 🔵 **Uploaded**: Blue border + background (`border-blue-200 bg-blue-50`)
- 🟢 **Completed**: Green border + background (`border-green-200 bg-green-50`)

#### C. Status Badges

**Pending Badge:**
```tsx
<span className="bg-yellow-100 text-yellow-800 border-yellow-300">
    ⏱️ Menunggu Upload
</span>
```

**Uploaded Badge:**
```tsx
<span className="bg-blue-100 text-blue-800 border-blue-300">
    📤 Sudah Diupload
</span>
```

**Completed Badge:**
```tsx
<span className="bg-green-100 text-green-800 border-green-300">
    ✅ Selesai
</span>
```

#### D. Upload Button

**For Pending Documents:**
```tsx
<label className="cursor-pointer">
    <div className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md">
        {uploadingDocumentId === request.id ? (
            <>
                <svg className="animate-spin ...">...</svg>
                Uploading...
            </>
        ) : (
            <>
                📤 Upload Dokumen
            </>
        )}
    </div>
    <input
        type="file"
        onChange={(e) => handleUploadDocument(request.id, e)}
        className="hidden"
        disabled={uploadingDocumentId === request.id}
    />
    {uploadErrors[request.id] && (
        <p className="text-xs text-red-600">{uploadErrors[request.id]}</p>
    )}
    <p className="text-xs text-gray-500">Max: 10MB</p>
</label>
```

**Features:**
- ✅ Hidden file input (custom styled button)
- ✅ Loading spinner saat upload
- ✅ Disabled saat sedang upload
- ✅ Error message display
- ✅ File size limit warning

**For Uploaded/Completed Documents:**
```tsx
<div className="flex items-center gap-2 text-sm text-gray-700">
    <svg className="...green...">checkmark</svg>
    <span className="font-medium">
        {status === 'uploaded' ? 'Menunggu Review' : 'Dokumen Diterima'}
    </span>
</div>
```

### 5. Conditional Rendering

**Only Show Section if Documents Exist:**
```tsx
{documentRequests && documentRequests.length > 0 && (
    <div className="document-requests-section">
        {/* ... */}
    </div>
)}
```

**Upload Button Only Active for Active Projects:**
```tsx
{request.status === 'pending' && isProjectActive && (
    <label>...</label>
)}

{!isProjectActive && request.status === 'pending' && (
    <div className="text-sm text-gray-500 italic">
        Proyek tidak aktif
    </div>
)}
```

## 🔧 Backend Integration

### Updated Controller Method
**File:** `app/Http/Controllers/Client/ClientController.php`

```php
public function showProject(Project $project)
{
    // ... existing code ...
    
    // Get project document requests
    $documentRequests = \App\Models\ProjectDocumentRequest::where('project_id', $project->id)
        ->with('requestedBy:id,name,email')
        ->orderByRaw("FIELD(status, 'pending', 'uploaded', 'completed')")
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($request) {
            return [
                'id' => $request->id,
                'project_id' => $request->project_id,
                'document_name' => $request->document_name,
                'description' => $request->description,
                'status' => $request->status,
                'file_path' => $request->file_path,
                'uploaded_at' => $request->uploaded_at,
                'created_at' => $request->created_at,
                'updated_at' => $request->updated_at,
                'requested_by' => $request->requestedBy ? [
                    'id' => $request->requestedBy->id,
                    'name' => $request->requestedBy->name,
                    'email' => $request->requestedBy->email,
                ] : null,
            ];
        });

    return Inertia::render('Client/Projects/Show', [
        'project' => [/* ... */],
        'workingSteps' => $workingSteps,
        'projectTeams' => $projectTeams,
        'documentRequests' => $documentRequests, // ✅ NEW
    ]);
}
```

**Key Points:**
- Load with `requestedBy` relation untuk nama requester
- Sort by status priority (pending first, then uploaded, then completed)
- Secondary sort by created_at DESC (newest first)

### Upload Endpoint (Already Exists)
**Route:** `POST /document-requests/{documentRequest}/upload`  
**Controller:** `ClientController::uploadProjectDocument()`

**What it does:**
1. Validates file (required, max 10MB)
2. Stores file in `storage/app/public/project_documents/{project_id}/`
3. Updates request: status = 'uploaded', file_path, uploaded_at
4. Fires `ProjectDocumentUploaded` event (broadcasts to company users)
5. Returns success response

## 📱 User Experience Flow

### Scenario 1: Client Menerima Permintaan Dokumen
1. Company user request dokumen "Laporan Keuangan 2024"
2. Event `NewProjectDocumentRequest` broadcast ke client
3. Client receives notification (if WebSocket active)
4. Client navigate ke project page
5. Melihat card dengan status **🟡 Menunggu Upload**
6. Click **📤 Upload Dokumen**
7. Pilih file dari komputer
8. Progress: "Uploading..." dengan spinner
9. Success: Page reload, status berubah **🔵 Sudah Diupload**
10. Event `ProjectDocumentUploaded` broadcast ke company users

### Scenario 2: Company Review & Complete
1. Company user receives notification
2. Navigate to project page
3. See **🔵 Uploaded** status
4. Click **Download** untuk review
5. After review, click **Mark Complete**
6. Status berubah **🟢 Selesai**
7. Client dapat melihat status completed

### Scenario 3: Upload dengan Error
1. Client click upload
2. Pilih file > 10MB
3. Error message: "File size must be less than 10MB"
4. File input di-reset
5. Client pilih file yang lebih kecil
6. Upload berhasil

## 🎨 Visual Design

### Color Palette
```css
Pending:
  - Border: border-yellow-200
  - Background: bg-yellow-50
  - Badge: bg-yellow-100 text-yellow-800 border-yellow-300
  - Hover: hover:shadow-md

Uploaded:
  - Border: border-blue-200
  - Background: bg-blue-50
  - Badge: bg-blue-100 text-blue-800 border-blue-300

Completed:
  - Border: border-green-200
  - Background: bg-green-50
  - Badge: bg-green-100 text-green-800 border-green-300
```

### Icons Used
- 📋 Document list icon (section header)
- 👤 User icon (requester)
- 📅 Calendar icon (request date)
- ⏱️ Clock icon (pending status)
- 📤 Upload icon (uploaded status)
- ✅ Checkmark icon (completed status)
- 🔄 Spinner (loading state)

### Typography
- **Document Name**: text-base font-semibold text-gray-900
- **Description**: text-sm text-gray-700 (in white box)
- **Metadata**: text-xs text-gray-600
- **Status Messages**: text-sm font-medium

## 🔒 Security & Validation

### Client-Side Validation
```typescript
// File size check (10MB)
if (file.size > 10 * 1024 * 1024) {
    setUploadErrors(prev => ({
        ...prev,
        [documentRequestId]: 'File size must be less than 10MB'
    }));
    return;
}
```

### Server-Side Validation (Backend)
```php
$request->validate([
    'file' => 'required|file|max:10240', // 10MB in KB
]);
```

### CSRF Protection
```typescript
headers: {
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
}
```

### Authorization
- Client hanya bisa upload dokumen untuk project mereka sendiri
- Backend checks: `$project->client_id === Auth::user()->client_id`

## 📊 Files Modified

### Frontend
- **File**: `resources/js/Pages/Client/Projects/Show.tsx`
- **Lines Added**: ~180 lines
- **Changes**:
  - Added `ProjectDocumentRequest` interface
  - Added 2 state variables
  - Added `handleUploadDocument` function
  - Added document requests section UI
  - Updated Props to include `documentRequests`

### Backend
- **File**: `app/Http/Controllers/Client/ClientController.php`
- **Lines Added**: ~30 lines
- **Changes**:
  - Query `ProjectDocumentRequest` in `showProject()`
  - Map results to array format
  - Pass to Inertia render

## ✅ Testing Checklist

### Manual Testing
- [ ] Client dapat melihat document requests
- [ ] Upload file < 10MB berhasil
- [ ] Upload file > 10MB ditolak dengan error
- [ ] Loading state tampil saat upload
- [ ] Page reload setelah upload success
- [ ] Status badge warna sesuai
- [ ] Uploaded date tampil setelah upload
- [ ] Upload disabled untuk project tidak aktif
- [ ] Upload disabled untuk status uploaded/completed
- [ ] Error message tampil jika upload gagal
- [ ] File input reset setelah error

### Integration Testing
- [ ] Upload trigger `ProjectDocumentUploaded` event
- [ ] Company users receive notification
- [ ] File tersimpan di storage dengan benar
- [ ] Database updated (status, file_path, uploaded_at)
- [ ] Download dari company side berfungsi

## 🚀 Deployment

### Build Assets
```bash
npm run build
```

### Check Errors
```bash
# TypeScript compilation
tsc --noEmit

# Vite build
vite build
```

### Migration (Already Run)
```bash
php artisan migrate
```

## 📝 Notes

### Performance Considerations
- Document requests eager-loaded dengan `requestedBy` relation
- Limited to current project only (tidak query semua projects)
- File upload menggunakan FormData (efficient untuk large files)
- Auto-reload setelah upload (simple approach, bisa diganti dengan live update)

### Future Enhancements
- [ ] Real-time update tanpa reload (WebSocket listener)
- [ ] Upload progress bar (percentage)
- [ ] Drag & drop file upload
- [ ] Preview uploaded document
- [ ] Download uploaded document (client side)
- [ ] Delete/replace uploaded document
- [ ] Multiple file upload untuk satu request
- [ ] Notification sound/toast untuk new requests

---

**Status**: ✅ COMPLETE  
**Implementation Date**: December 24, 2025  
**Last Updated**: December 24, 2025  
**Developer**: Lana 🚀
