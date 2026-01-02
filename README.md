# KAP AHR - Laravel React Application

Aplikasi Laravel dengan React frontend menggunakan Laravel Breeze untuk autentikasi dan sistem role-based access control (RBAC).

## Features

- **Authentication**: Laravel Breeze with React frontend
- **Role-based Access Control**: 4 roles dengan akses yang berbeda
  - **Admin**: Full access ke sistem
  - **Partner**: Akses business partner
  - **Staff**: Akses operational staff
  - **Klien**: Akses terbatas untuk client
- **Dashboard**: Dashboard terpisah untuk setiap role
- **Database**: SQLite database dengan migrations dan seeders

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React dengan TypeScript
- **CSS**: Tailwind CSS
- **Database**: SQLite
- **Build Tool**: Vite

## Installation

1. Clone repository dan masuk ke directory
```bash
cd source
```

2. Install PHP dependencies
```bash
composer install
```

3. Install NPM dependencies
```bash
npm install --force
```

4. Copy environment file
```bash
copy .env.example .env
```

5. Generate application key
```bash
php artisan key:generate
```

6. Run migrations dan seeders
```bash
php artisan migrate
php artisan db:seed
```

7. Build assets
```bash
npm run build
```

8. Start development server
```bash
php artisan serve
```

## Default Users

Aplikasi sudah include default users untuk testing:

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@example.com | password |
| Partner | partner@example.com | password |
| Staff | staff@example.com | password |
| Klien | klien@example.com | password |

## Routes

### Authentication Routes
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Redirect dashboard berdasarkan role

### Role-based Dashboard Routes
- `/admin/dashboard` - Admin dashboard (role: admin)
- `/partner/dashboard` - Partner dashboard (role: partner) 
- `/staff/dashboard` - Staff dashboard (role: staff)
- `/klien/dashboard` - Klien dashboard (role: klien)

## Database Structure

### Tables
- `users` - User accounts
- `roles` - User roles (admin, partner, staff, klien)
- Standard Laravel tables (cache, jobs, migrations, etc.)

### Relationships
- `User` belongsTo `Role`
- `Role` hasMany `Users`

## Development

### Run development server
```bash
php artisan serve
```

### Watch for asset changes
```bash
npm run dev
```

### Run tests
```bash
php artisan test
```

## Key Files

### Backend
- `app/Models/User.php` - User model dengan role relationships
- `app/Models/Role.php` - Role model
- `app/Http/Middleware/RoleMiddleware.php` - Role authorization middleware
- `app/Http/Controllers/AdminController.php` - Admin controller
- `app/Http/Controllers/PartnerController.php` - Partner controller
- `app/Http/Controllers/StaffController.php` - Staff controller
- `app/Http/Controllers/KlienController.php` - Klien controller

### Frontend
- `resources/js/Pages/Admin/Dashboard.tsx` - Admin dashboard
- `resources/js/Pages/Partner/Dashboard.tsx` - Partner dashboard
- `resources/js/Pages/Staff/Dashboard.tsx` - Staff dashboard
- `resources/js/Pages/Klien/Dashboard.tsx` - Klien dashboard

### Database
- `database/migrations/` - Database schema migrations
- `database/seeders/RoleSeeder.php` - Role data seeder
- `database/seeders/AdminUserSeeder.php` - Test users seeder

## License

Open source project.