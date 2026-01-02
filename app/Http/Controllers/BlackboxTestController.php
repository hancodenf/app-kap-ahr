<?php

namespace App\Http\Controllers;

use App\Models\BlackboxTestSession;
use App\Models\BlackboxTestResult;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlackboxTestController extends Controller
{
    private function getTestModules()
    {
        return [
            [
                'name' => 'Autentikasi',
                'role' => 'Public',
                'tests' => [
                    ['feature' => 'Login - Valid Credentials', 'scenario' => 'User memasukkan email dan password yang benar'],
                    ['feature' => 'Login - Invalid Credentials', 'scenario' => 'User memasukkan email/password yang salah'],
                    ['feature' => 'Login - Account Suspension', 'scenario' => 'User gagal login 3x berturut-turut'],
                    ['feature' => 'Forgot Password', 'scenario' => 'User request reset password melalui email'],
                    ['feature' => 'Reset Password', 'scenario' => 'User mengubah password melalui link reset'],
                    ['feature' => 'Logout', 'scenario' => 'User klik tombol logout'],
                ]
            ],
            [
                'name' => 'Admin - User Management',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'Dashboard Admin', 'scenario' => 'Admin mengakses halaman dashboard'],
                    ['feature' => 'List Users', 'scenario' => 'Admin melihat daftar semua users dengan pagination dan search'],
                    ['feature' => 'Create User', 'scenario' => 'Admin membuat user baru dengan role tertentu'],
                    ['feature' => 'Edit User', 'scenario' => 'Admin mengubah data user (nama, email, role, position)'],
                    ['feature' => 'Delete User', 'scenario' => 'Admin menghapus user dari sistem'],
                    ['feature' => 'Toggle User Status', 'scenario' => 'Admin mengaktifkan/menonaktifkan user'],
                    ['feature' => 'View User Detail', 'scenario' => 'Admin melihat detail lengkap user'],
                    ['feature' => 'Search & Filter Users', 'scenario' => 'Admin mencari user berdasarkan nama, email, atau role'],
                ]
            ],
            [
                'name' => 'Admin - Client Management',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'List Clients', 'scenario' => 'Admin melihat daftar semua client dengan info lengkap'],
                    ['feature' => 'Create Client', 'scenario' => 'Admin menambah client baru (nama, alamat, kementrian, kode satker, type, logo)'],
                    ['feature' => 'Edit Client', 'scenario' => 'Admin mengubah informasi client'],
                    ['feature' => 'Delete Client', 'scenario' => 'Admin menghapus client dari sistem'],
                    ['feature' => 'View Client Detail', 'scenario' => 'Admin melihat detail client dan project terkait'],
                    ['feature' => 'Upload Client Logo', 'scenario' => 'Admin mengupload logo client'],
                    ['feature' => 'Search Clients', 'scenario' => 'Admin mencari client berdasarkan nama, alamat, kementrian'],
                ]
            ],
            [
                'name' => 'Admin - Project Templates',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'List Project Templates', 'scenario' => 'Admin melihat daftar semua template project'],
                    ['feature' => 'Create Template', 'scenario' => 'Admin membuat template project baru'],
                    ['feature' => 'Edit Template', 'scenario' => 'Admin mengubah nama template'],
                    ['feature' => 'Delete Template', 'scenario' => 'Admin menghapus template project'],
                    ['feature' => 'Add Working Step to Template', 'scenario' => 'Admin menambah working step dalam template'],
                    ['feature' => 'Edit Working Step', 'scenario' => 'Admin mengubah working step dalam template'],
                    ['feature' => 'Delete Working Step', 'scenario' => 'Admin menghapus working step dari template'],
                    ['feature' => 'Reorder Working Steps', 'scenario' => 'Admin mengubah urutan working steps dengan drag & drop'],
                    ['feature' => 'Add Task to Template', 'scenario' => 'Admin menambah task dalam working step dengan konfigurasi client interaction'],
                    ['feature' => 'Edit Task in Template', 'scenario' => 'Admin mengubah task (nama, comment, client interaction, is_required)'],
                    ['feature' => 'Delete Task from Template', 'scenario' => 'Admin menghapus task dari template'],
                    ['feature' => 'Reorder Tasks in Template', 'scenario' => 'Admin mengubah urutan tasks dengan drag & drop'],
                ]
            ],
            [
                'name' => 'Admin - Projects',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'List Projects', 'scenario' => 'Admin melihat daftar semua project dengan filter dan search'],
                    ['feature' => 'Create Project', 'scenario' => 'Admin membuat project baru untuk client tertentu'],
                    ['feature' => 'Generate Project from Template', 'scenario' => 'Admin generate project dari template yang sudah ada'],
                    ['feature' => 'Edit Project Name', 'scenario' => 'Admin mengubah nama project'],
                    ['feature' => 'Update Project Status', 'scenario' => 'Admin mengubah status project (open/closed)'],
                    ['feature' => 'Delete Project', 'scenario' => 'Admin menghapus project'],
                    ['feature' => 'View Project Detail', 'scenario' => 'Admin melihat detail project dengan working steps dan tasks'],
                    ['feature' => 'Add Team Member', 'scenario' => 'Admin menambah team member ke project dengan role tertentu'],
                    ['feature' => 'Edit Team Member Role', 'scenario' => 'Admin mengubah role team member (partner/manager/supervisor/team leader/member)'],
                    ['feature' => 'Remove Team Member', 'scenario' => 'Admin menghapus team member dari project'],
                    ['feature' => 'Add Working Step to Project', 'scenario' => 'Admin menambah working step ke project'],
                    ['feature' => 'Edit Working Step', 'scenario' => 'Admin mengubah working step dalam project'],
                    ['feature' => 'Delete Working Step', 'scenario' => 'Admin menghapus working step dari project'],
                    ['feature' => 'Add Task to Project', 'scenario' => 'Admin menambah task ke working step dengan konfigurasi lengkap'],
                    ['feature' => 'Edit Task in Project', 'scenario' => 'Admin mengubah task (nama, status, requirement, client interaction)'],
                    ['feature' => 'Delete Task from Project', 'scenario' => 'Admin menghapus task dari project'],
                    ['feature' => 'Update Task Status', 'scenario' => 'Admin mengubah status task (pending/in_progress/completed)'],
                    ['feature' => 'Reorder Steps & Tasks', 'scenario' => 'Admin mengubah urutan working steps dan tasks'],
                ]
            ],
            [
                'name' => 'Admin - Registered APs',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'List Registered APs', 'scenario' => 'Admin melihat daftar semua AP yang terdaftar'],
                    ['feature' => 'Create Registered AP', 'scenario' => 'Admin mendaftarkan AP baru untuk user'],
                    ['feature' => 'Edit Registered AP', 'scenario' => 'Admin mengubah data AP (nomor, tanggal, status)'],
                    ['feature' => 'Delete Registered AP', 'scenario' => 'Admin menghapus AP yang terdaftar'],
                    ['feature' => 'View AP Detail', 'scenario' => 'Admin melihat detail lengkap AP'],
                    ['feature' => 'Update AP Status', 'scenario' => 'Admin mengubah status AP (active/inactive/expired)'],
                ]
            ],
            [
                'name' => 'Admin - News Management',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'List News', 'scenario' => 'Admin melihat daftar semua berita'],
                    ['feature' => 'Create News', 'scenario' => 'Admin membuat berita baru dengan featured image'],
                    ['feature' => 'Edit News', 'scenario' => 'Admin mengubah konten berita'],
                    ['feature' => 'Delete News', 'scenario' => 'Admin menghapus berita'],
                    ['feature' => 'Publish News', 'scenario' => 'Admin mempublikasikan berita (draft → published)'],
                    ['feature' => 'Upload Featured Image', 'scenario' => 'Admin mengupload gambar utama untuk berita'],
                    ['feature' => 'View News Detail', 'scenario' => 'Admin melihat preview berita lengkap'],
                ]
            ],
            [
                'name' => 'Admin - Login Security',
                'role' => 'Admin',
                'tests' => [
                    ['feature' => 'Security Unlock', 'scenario' => 'Admin memasukkan key untuk unlock fitur monitoring'],
                    ['feature' => 'View Failed Login Attempts', 'scenario' => 'Admin melihat daftar percobaan login gagal'],
                    ['feature' => 'View Attempt Detail', 'scenario' => 'Admin melihat detail attempt (IP, location, user agent, photo)'],
                    ['feature' => 'Unsuspend User', 'scenario' => 'Admin membuka suspend akun user'],
                    ['feature' => 'Delete Attempt Record', 'scenario' => 'Admin menghapus record percobaan login'],
                    ['feature' => 'Security Lock', 'scenario' => 'Admin mengunci kembali fitur monitoring'],
                ]
            ],
            [
                'name' => 'Company - Dashboard',
                'role' => 'Company',
                'tests' => [
                    ['feature' => 'View Dashboard', 'scenario' => 'Company user mengakses dashboard'],
                    ['feature' => 'View Statistics', 'scenario' => 'Company user melihat statistik project dan task'],
                    ['feature' => 'View Recent Activities', 'scenario' => 'Company user melihat aktivitas terbaru'],
                ]
            ],
            [
                'name' => 'Company - Clients',
                'role' => 'Company',
                'tests' => [
                    ['feature' => 'View My Clients', 'scenario' => 'Company user melihat daftar client dari project yang ditangani'],
                    ['feature' => 'Search Clients', 'scenario' => 'Company user mencari client dengan keyword'],
                    ['feature' => 'View Client Detail', 'scenario' => 'Company user melihat detail client dengan logo dan info lengkap'],
                    ['feature' => 'Filter Client Projects', 'scenario' => 'Company user filter project client berdasarkan status dengan pagination'],
                ]
            ],
            [
                'name' => 'Company - Projects',
                'role' => 'Company',
                'tests' => [
                    ['feature' => 'View My Projects', 'scenario' => 'Company user melihat daftar project yang ditangani'],
                    ['feature' => 'Search & Filter Projects', 'scenario' => 'Company user mencari/filter project berdasarkan status, client'],
                    ['feature' => 'View Project Detail', 'scenario' => 'Company user melihat detail project dengan working steps dan tasks'],
                    ['feature' => 'View Project Team', 'scenario' => 'Company user melihat team members dalam project'],
                    ['feature' => 'View Task Detail', 'scenario' => 'Company user melihat detail task dengan documents dan approval flow'],
                    ['feature' => 'Update Task Status', 'scenario' => 'Company user mengubah status task sesuai role'],
                    ['feature' => 'Add Task Comment', 'scenario' => 'Company user menambahkan comment pada task'],
                    ['feature' => 'Upload Task Documents', 'scenario' => 'Company user mengupload dokumen untuk task'],
                ]
            ],
            [
                'name' => 'Company - Workflow Approval',
                'role' => 'Company',
                'tests' => [
                    ['feature' => 'View Approval Requests', 'scenario' => 'Company user (dengan role tertentu) melihat task yang butuh approval'],
                    ['feature' => 'View Approval Detail', 'scenario' => 'Company user melihat detail task approval dengan hierarchy'],
                    ['feature' => 'Approve Task', 'scenario' => 'Company user (team leader/supervisor/manager/partner) approve task'],
                    ['feature' => 'Reject Task', 'scenario' => 'Company user reject task dengan alasan'],
                    ['feature' => 'Accept Client Documents', 'scenario' => 'Company user menerima dokumen dari client'],
                    ['feature' => 'Request Document Reupload', 'scenario' => 'Company user meminta client upload ulang dokumen'],
                ]
            ],
            [
                'name' => 'Client - Dashboard',
                'role' => 'Client',
                'tests' => [
                    ['feature' => 'View Dashboard', 'scenario' => 'Client mengakses dashboard'],
                    ['feature' => 'View Project Summary', 'scenario' => 'Client melihat ringkasan project yang sedang berjalan'],
                    ['feature' => 'View Recent Updates', 'scenario' => 'Client melihat update terbaru dari project'],
                ]
            ],
            [
                'name' => 'Client - Projects',
                'role' => 'Client',
                'tests' => [
                    ['feature' => 'View My Projects', 'scenario' => 'Client melihat daftar project miliknya'],
                    ['feature' => 'View Project Detail', 'scenario' => 'Client melihat detail project dengan progress'],
                    ['feature' => 'View Working Steps', 'scenario' => 'Client melihat tahapan working steps (locked/unlocked)'],
                    ['feature' => 'View Task List', 'scenario' => 'Client melihat daftar tasks dalam working step'],
                    ['feature' => 'View Task Detail', 'scenario' => 'Client melihat detail task berdasarkan client interaction level'],
                    ['feature' => 'Add Comment to Task', 'scenario' => 'Client menambahkan comment pada task (jika interaction = comment/upload)'],
                    ['feature' => 'Upload Documents', 'scenario' => 'Client mengupload dokumen ke task (jika interaction = upload)'],
                ]
            ],
            [
                'name' => 'Public - News',
                'role' => 'All Users',
                'tests' => [
                    ['feature' => 'View News List', 'scenario' => 'User (authenticated) melihat daftar berita yang published'],
                    ['feature' => 'Read News Detail', 'scenario' => 'User membaca konten berita lengkap'],
                    ['feature' => 'View Featured Image', 'scenario' => 'User melihat gambar utama berita'],
                ]
            ],
            [
                'name' => 'Profile Management',
                'role' => 'All Users',
                'tests' => [
                    ['feature' => 'View Profile', 'scenario' => 'User melihat halaman profile'],
                    ['feature' => 'Update Profile Information', 'scenario' => 'User mengubah nama, email, whatsapp'],
                    ['feature' => 'Update Password', 'scenario' => 'User mengubah password'],
                    ['feature' => 'Upload Profile Photo', 'scenario' => 'User mengupload foto profile'],
                ]
            ],
        ];
    }

    public function index(Request $request)
    {
        $token = $request->query('token');
        
        if ($token) {
            $session = BlackboxTestSession::where('token', $token)->first();
            if (!$session) {
                return redirect()->route('blackbox.test')->with('error', 'Session tidak ditemukan');
            }
        } else {
            // Create new session
            $session = BlackboxTestSession::create([
                'token' => Str::random(32),
            ]);
            return redirect()->route('blackbox.test', ['token' => $session->token]);
        }

        $modules = $this->getTestModules();
        $results = $session->results->groupBy('module_name');

        return view('blackbox-test', compact('session', 'modules', 'results'));
    }

    public function saveResult(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:blackbox_test_sessions,id',
            'module_name' => 'required|string',
            'test_number' => 'required|integer',
            'feature_name' => 'required|string',
            'test_scenario' => 'required|string',
            'expected_result' => 'nullable|string',
            'actual_result' => 'nullable|string',
            'conclusion' => 'nullable|in:valid,invalid,pending',
        ]);

        $result = BlackboxTestResult::updateOrCreate(
            [
                'session_id' => $validated['session_id'],
                'module_name' => $validated['module_name'],
                'test_number' => $validated['test_number'],
            ],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil disimpan',
            'result' => $result
        ]);
    }

    public function updateSession(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:blackbox_test_sessions,id',
            'tester_name' => 'nullable|string',
            'test_date' => 'nullable|date',
            'app_version' => 'nullable|string',
            'browser_platform' => 'nullable|string',
        ]);

        $session = BlackboxTestSession::findOrFail($validated['session_id']);
        $session->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Session info berhasil diupdate',
            'session' => $session
        ]);
    }

    public function exportPdf($token)
    {
        $session = BlackboxTestSession::where('token', $token)->firstOrFail();
        $modules = $this->getTestModules();
        $results = $session->results->groupBy('module_name');

        return view('blackbox-test-pdf', compact('session', 'modules', 'results'));
    }
}
