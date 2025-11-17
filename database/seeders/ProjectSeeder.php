<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectTeam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = Client::all();

        foreach ($clients as $client) {
            $projectName = 'Audit Laporan Keuangan ' . $client->name . ' Tahun 2024';
            
            $project = Project::create([
                'name' => $projectName,
                'slug' => Str::slug($projectName),
                'client_id' => $client->id,
                // Denormalized client data
                'client_name' => $client->name,
                'client_alamat' => $client->alamat,
                'client_kementrian' => $client->kementrian,
                'client_kode_satker' => $client->kode_satker,
            ]);

            // Create project team for this project
            $this->createProjectTeam($project);
        }
    }

    private function createProjectTeam($project)
    {
        // Get users by position/role for project team
        $partner = \App\Models\User::where('role', 'company')
            ->where('position', 'Partner')
            ->first();
        $manager = \App\Models\User::where('role', 'company')
            ->where('position', 'Associates Manager')
            ->first();
        $supervisor = \App\Models\User::where('role', 'company')
            ->where('position', 'Tenaga Ahli - Supervisor')
            ->first();
        $seniorAuditor = \App\Models\User::where('role', 'company')
            ->where('position', 'Senior Auditor')
            ->first();
        $juniorAuditor = \App\Models\User::where('role', 'company')
            ->where('position', 'Junior Auditor')
            ->first();

        // Create project team with different roles
        $teamMembers = [];
        
        if ($partner) {
            $teamMembers[] = ['user' => $partner, 'role' => 'partner'];
        }
        if ($manager) {
            $teamMembers[] = ['user' => $manager, 'role' => 'manager'];
        }
        if ($supervisor) {
            $teamMembers[] = ['user' => $supervisor, 'role' => 'supervisor'];
        }
        if ($seniorAuditor) {
            $teamMembers[] = ['user' => $seniorAuditor, 'role' => 'team leader'];
        }
        if ($juniorAuditor) {
            $teamMembers[] = ['user' => $juniorAuditor, 'role' => 'member'];
        }

        foreach ($teamMembers as $member) {
            $user = $member['user'];
            
            ProjectTeam::create([
                'project_id' => $project->id,
                'user_id' => $user->id,
                'role' => $member['role'],
                // Denormalized project data
                'project_name' => $project->name,
                'project_client_name' => $project->client_name,
                // Denormalized user data
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_position' => $user->position,
            ]);
        }
    }
}
