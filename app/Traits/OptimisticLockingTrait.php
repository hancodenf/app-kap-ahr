<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

/**
 * OptimisticLockingTrait
 * 
 * Provides optimistic locking functionality to prevent race conditions
 * in concurrent data modifications.
 */
trait OptimisticLockingTrait
{
    /**
     * Boot the trait and add event listeners
     */
    public static function bootOptimisticLockingTrait()
    {
        // Auto-increment version and update metadata on saving
        static::saving(function (Model $model) {
            if ($model->isDirty() && !$model->wasRecentlyCreated) {
                $model->version = ($model->getOriginal('version') ?? 0) + 1;
            }
            
            $model->last_modified_at = now();
            $model->last_modified_by = Auth::id();
        });
    }

    /**
     * Safely update a model with optimistic locking
     * 
     * @param array $data Data to update
     * @param int|null $expectedVersion Expected current version
     * @return bool
     * @throws Exception
     */
    public function updateSafely(array $data, ?int $expectedVersion = null): bool
    {
        return DB::transaction(function () use ($data, $expectedVersion) {
            // If no expected version provided, use current version
            if ($expectedVersion === null) {
                $expectedVersion = $this->version ?? 0;
            }

            // Lock the row for update and verify version
            $current = static::where('id', $this->id)
                           ->where('version', $expectedVersion)
                           ->lockForUpdate()
                           ->first();

            if (!$current) {
                throw new Exception(
                    "Concurrent modification detected. The record has been modified by another user. " .
                    "Please refresh and try again. (Expected version: {$expectedVersion})"
                );
            }

            // Update with version increment and metadata
            $data['version'] = $expectedVersion + 1;
            $data['last_modified_at'] = now();
            $data['last_modified_by'] = Auth::id();

            return $current->update($data);
        });
    }

    /**
     * Create a new record with initial version and metadata
     * 
     * @param array $data
     * @return static
     */
    public static function createSafely(array $data): self
    {
        return DB::transaction(function () use ($data) {
            $data['version'] = 0;
            $data['last_modified_at'] = now();
            $data['last_modified_by'] = Auth::id();

            return static::create($data);
        });
    }

    /**
     * Delete with version verification
     * 
     * @param int|null $expectedVersion
     * @return bool|null
     * @throws Exception
     */
    public function deleteSafely(?int $expectedVersion = null): ?bool
    {
        return DB::transaction(function () use ($expectedVersion) {
            if ($expectedVersion === null) {
                $expectedVersion = $this->version ?? 0;
            }

            // Verify version before deletion
            $current = static::where('id', $this->id)
                           ->where('version', $expectedVersion)
                           ->lockForUpdate()
                           ->first();

            if (!$current) {
                throw new Exception(
                    "Concurrent modification detected. The record has been modified by another user. " .
                    "Please refresh and try again."
                );
            }

            return $current->delete();
        });
    }

    /**
     * Get version info for client-side conflict detection
     * 
     * @return array
     */
    public function getVersionInfo(): array
    {
        return [
            'version' => $this->version ?? 0,
            'last_modified_at' => $this->last_modified_at?->toISOString(),
            'last_modified_by' => $this->lastModifiedBy?->name ?? 'System',
            'last_modified_by_id' => $this->last_modified_by
        ];
    }

    /**
     * Check if record has been modified since given version
     * 
     * @param int $version
     * @return bool
     */
    public function isModifiedSince(int $version): bool
    {
        return ($this->version ?? 0) > $version;
    }

    /**
     * Refresh model and check for modifications
     * 
     * @param int $expectedVersion
     * @return bool True if still current, false if modified
     */
    public function isStillCurrent(int $expectedVersion): bool
    {
        $this->refresh();
        return ($this->version ?? 0) === $expectedVersion;
    }

    /**
     * Get the last user who modified this record
     */
    public function lastModifiedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'last_modified_by');
    }

    /**
     * Scope to get records modified after specific version
     */
    public function scopeModifiedAfterVersion($query, int $version)
    {
        return $query->where('version', '>', $version);
    }

    /**
     * Scope to get recently modified records
     */
    public function scopeRecentlyModified($query, int $hours = 24)
    {
        return $query->where('last_modified_at', '>=', now()->subHours($hours));
    }
}
