<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'alamat',
        'kementrian',
        'kode_satker',
    ];

    /**
     * Get all user accounts related to this client.
     * 1 Client has many Users (users with role client that have client_id = this client's id)
     */
    public function clientUsers(): HasMany
    {
        return $this->hasMany(User::class, 'client_id', 'id');
    }

    /**
     * Get the projects for the client.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get the storage path for this client.
     * 
     * @return string
     */
    public function getStoragePath(): string
    {
        return "clients/{$this->slug}";
    }

    /**
     * Get the full storage path (with storage/app/public prefix).
     * 
     * @return string
     */
    public function getFullStoragePath(): string
    {
        return storage_path("app/public/{$this->getStoragePath()}");
    }
}
