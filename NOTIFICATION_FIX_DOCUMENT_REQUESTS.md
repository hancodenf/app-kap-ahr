# Notification Fix: Project Document Requests

## Problem
Notifikasi tidak muncul di sisi client ketika company request dokumen.

## Root Cause
Event broadcast via WebSocket sudah berfungsi, tetapi **notification tidak disimpan ke database**. Akibatnya:
- Client tidak melihat notification badge/icon di UI
- Notification tidak persist setelah reload
- Hanya bisa dilihat jika WebSocket aktif real-time

## Solution

### 1. Company Request Documents → Client Notification

**File:** `app/Http/Controllers/Company/CompanyController.php`  
**Method:** `storeProjectDocumentRequests()`

**Added:**
```php
// Create database notifications for each client user
foreach ($clientUserIds as $clientUserId) {
    \App\Models\Notification::create([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\ProjectDocumentRequestNotification',
        'notifiable_type' => 'App\\Models\\User',
        'notifiable_id' => $clientUserId,
        'data' => json_encode([
            'title' => count($createdRequests) > 1 
                ? 'Permintaan Dokumen Baru (' . count($createdRequests) . ' dokumen)'
                : 'Permintaan Dokumen Baru',
            'message' => $message,
            'project_id' => $project->id,
            'project_name' => $project->name,
            'document_count' => count($createdRequests),
            'first_document' => $createdRequests[0]->document_name,
            'requested_by' => Auth::user()->name,
            'url' => route('klien.projects.show', $project->slug),
            'type' => 'project_document_request',
        ]),
        'read_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}
```

**Benefits:**
- ✅ Client melihat notification di bell icon
- ✅ Notification persist setelah reload
- ✅ Client bisa click notification untuk langsung ke project page
- ✅ Menampilkan jumlah dokumen yang diminta
- ✅ Menampilkan nama requester

### 2. Client Upload Document → Company Notification

**File:** `app/Http/Controllers/Client/ClientController.php`  
**Method:** `uploadProjectDocument()`

**Added:**
```php
// Create database notifications for each company user
foreach ($companyUserIds as $companyUserId) {
    \App\Models\Notification::create([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\ProjectDocumentUploadedNotification',
        'notifiable_type' => 'App\\Models\\User',
        'notifiable_id' => $companyUserId,
        'data' => json_encode([
            'title' => 'Dokumen Diupload Client',
            'message' => "Client uploaded document: {$documentRequest->document_name}",
            'project_id' => $project->id,
            'project_name' => $project->name,
            'document_name' => $documentRequest->document_name,
            'document_request_id' => $documentRequest->id,
            'uploaded_by' => Auth::user()->name,
            'url' => route('company.projects.show', $project->slug),
            'type' => 'project_document_uploaded',
        ]),
        'read_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}
```

**Benefits:**
- ✅ Company users melihat notification saat client upload
- ✅ Notification persist di database
- ✅ Click notification langsung ke project page
- ✅ Menampilkan nama dokumen
- ✅ Menampilkan siapa yang upload

## Notification Structure

### Database Table: `notifications`
```sql
- id (uuid)
- type (string) - Notification class name
- notifiable_type (string) - 'App\Models\User'
- notifiable_id (uuid) - User ID
- data (json) - Notification payload
- read_at (timestamp, nullable)
- created_at, updated_at
```

### Notification Data Schema

**For Document Request:**
```json
{
  "title": "Permintaan Dokumen Baru (3 dokumen)",
  "message": "New document requests (3 documents) for project: Project ABC",
  "project_id": "uuid",
  "project_name": "Project ABC",
  "document_count": 3,
  "first_document": "Financial Statement 2024",
  "requested_by": "John Smith",
  "url": "/klien/projects/project-abc",
  "type": "project_document_request"
}
```

**For Document Upload:**
```json
{
  "title": "Dokumen Diupload Client",
  "message": "Client uploaded document: Financial Statement 2024",
  "project_id": "uuid",
  "project_name": "Project ABC",
  "document_name": "Financial Statement 2024",
  "document_request_id": "uuid",
  "uploaded_by": "Client User Name",
  "url": "/company/projects/project-abc",
  "type": "project_document_uploaded"
}
```

## How Notifications Work

### Dual System
1. **WebSocket Broadcast** (Real-time, instant)
   - `event(new NewProjectDocumentRequest(...))` 
   - Sends to connected users immediately
   - Only works if WebSocket/Pusher active
   - Lost if user offline

2. **Database Notifications** (Persistent)
   - `Notification::create([...])`
   - Saved to database
   - Visible after reload
   - Works even if user offline
   - Shows notification badge count

### User Experience Flow

**Scenario 1: User Online (WebSocket Active)**
1. Action happens (request/upload)
2. WebSocket sends instant notification → Toast/alert appears
3. Database notification created → Badge count updates
4. User sees both instant alert + persistent badge

**Scenario 2: User Offline**
1. Action happens (request/upload)
2. WebSocket broadcast fails (user not connected)
3. Database notification created → Stored
4. User logs in later → Sees notification badge
5. User clicks bell icon → Sees all unread notifications

## Testing Checklist

### Test 1: Company Request → Client Notification
- [ ] Company submits document request
- [ ] Check database: `SELECT * FROM notifications WHERE notifiable_id = 'client_user_id'`
- [ ] Login as client
- [ ] See notification badge (unread count)
- [ ] Click bell icon, see notification
- [ ] Click notification, redirects to project page
- [ ] Notification marked as read

### Test 2: Client Upload → Company Notification
- [ ] Client uploads document
- [ ] Check database: `SELECT * FROM notifications WHERE notifiable_id = 'company_user_id'`
- [ ] Login as company user
- [ ] See notification badge
- [ ] Click bell icon, see notification
- [ ] Click notification, redirects to project page
- [ ] Can download uploaded document

### Test 3: Multiple Users
- [ ] Request 5 documents
- [ ] Check all client users receive notification
- [ ] Each client user has separate notification record
- [ ] Each can mark their own as read independently

### Test 4: Offline Users
- [ ] User A logs out
- [ ] User B requests documents
- [ ] User A logs in later
- [ ] User A sees notification badge
- [ ] Notification still there after days

## Database Query Examples

### Count Unread Notifications
```sql
SELECT COUNT(*) 
FROM notifications 
WHERE notifiable_id = 'user_id' 
  AND read_at IS NULL;
```

### Get Recent Project Document Notifications
```sql
SELECT * 
FROM notifications 
WHERE notifiable_id = 'user_id'
  AND JSON_EXTRACT(data, '$.type') IN ('project_document_request', 'project_document_uploaded')
ORDER BY created_at DESC
LIMIT 10;
```

### Mark as Read
```sql
UPDATE notifications 
SET read_at = NOW() 
WHERE id = 'notification_id';
```

## UI Integration

Notifications appear in the **bell icon** at the top-right of the authenticated layout:

```tsx
// Pseudocode - existing notification system
<BellIcon>
  <Badge count={unreadCount} />
  <Dropdown>
    {notifications.map(notif => (
      <NotificationItem 
        title={notif.data.title}
        message={notif.data.message}
        url={notif.data.url}
        onClick={() => markAsRead(notif.id)}
      />
    ))}
  </Dropdown>
</BellIcon>
```

## Related Files

### Modified Files
- ✅ `app/Http/Controllers/Company/CompanyController.php` - Added notification creation
- ✅ `app/Http/Controllers/Client/ClientController.php` - Added notification creation

### Event Files (No changes needed)
- `app/Events/NewProjectDocumentRequest.php` - Handles WebSocket broadcast
- `app/Events/ProjectDocumentUploaded.php` - Handles WebSocket broadcast

### Notification System (Already exists)
- `app/Models/Notification.php` - Eloquent model
- `database/migrations/..._create_notifications_table.php` - Schema
- UI components in `resources/js/Layouts/AuthenticatedLayout.tsx`

## Future Enhancements

### Email Notifications
```php
// In controller, after creating notification
Mail::to($clientUser->email)->send(
    new ProjectDocumentRequestMail($documentRequest, $project)
);
```

### Push Notifications (Mobile)
```php
// Using Firebase Cloud Messaging
$user->notify(new ProjectDocumentRequestNotification($documentRequest));
```

### Notification Preferences
Allow users to configure which notifications they want to receive:
- Email: Yes/No
- Push: Yes/No  
- WebSocket: Yes/No

---

**Status**: ✅ Fixed  
**Date**: December 24, 2025  
**Impact**: High - Core feature functionality
**Breaking Changes**: None - Additive only
