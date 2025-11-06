<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectTeam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = Client::all();

        foreach ($clients as $client) {
            $project = Project::create([
                'name' => 'Audit Laporan Keuangan ' . $client->name . ' Tahun 2024',
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
        // Create project team with different roles
        $teamMembers = [
            ['user_id' => 2, 'role' => 'partner'],      // John Partner
            ['user_id' => 3, 'role' => 'manager'],      // Jane Manager
            ['user_id' => 4, 'role' => 'supervisor'],   // Bob Supervisor
            ['user_id' => 5, 'role' => 'team leader'],  // Alice Team Leader
            ['user_id' => 6, 'role' => 'member'],       // Mike Auditor
        ];

        foreach ($teamMembers as $member) {
            $user = \App\Models\User::find($member['user_id']);
            
            ProjectTeam::create([
                'project_id' => $project->id,
                'user_id' => $member['user_id'],
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
