<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tahaps = [
            [
                'name' => 'Perikatan',
                'slug' => Str::slug('Perikatan'),
            ],
            [
                'name' => 'Perencanaan',
                'slug' => Str::slug('Perencanaan'),
            ],
            [
                'name' => 'Pelaksanaan Audit',
                'slug' => Str::slug('Pelaksanaan Audit'),
            ],
            [
                'name' => 'Pelaporan Audit',
                'slug' => Str::slug('Pelaporan Audit'),
            ],
        ];

        foreach ($tahaps as $tahap) {
            Level::firstOrCreate(['slug' => $tahap['slug']], $tahap);
        }
    }
}
