<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Throwable;

/**
 * SafeTransactionService
 * 
 * Provides safe transaction management with proper error handling
 * and deadlock detection for race condition prevention.
 */
class SafeTransactionService
{
    /**
     * Execute a callback within a database transaction with retry logic
     * 
     * @param callable $callback
     * @param int $maxRetries Maximum number of retries for deadlocks
     * @param int $retryDelay Delay between retries in milliseconds
     * @return mixed
     * @throws Exception
     */
    public static function executeWithRetry(callable $callback, int $maxRetries = 3, int $retryDelay = 100)
    {
        $attempts = 0;
        
        while ($attempts < $maxRetries) {
            try {
                return DB::transaction(function () use ($callback) {
                    return $callback();
                }, 5); // 5 second timeout
                
            } catch (Throwable $e) {
                $attempts++;
                
                // Check if it's a deadlock or lock timeout
                if (self::isDeadlockOrLockTimeout($e) && $attempts < $maxRetries) {
                    // Log the retry attempt
                    Log::warning("Database deadlock detected, retrying... (Attempt {$attempts}/{$maxRetries})", [
                        'error' => $e->getMessage(),
                        'attempt' => $attempts
                    ]);
                    
                    // Wait before retrying with exponential backoff
                    usleep($retryDelay * 1000 * $attempts);
                    continue;
                }
                
                // If not a deadlock or max retries reached, throw the exception
                throw $e;
            }
        }
        
        throw new Exception("Transaction failed after {$maxRetries} attempts due to deadlocks");
    }

    /**
     * Execute critical section with row-level locking
     * 
     * @param string $modelClass
     * @param mixed $id
     * @param callable $callback
     * @return mixed
     */
    public static function withRowLock(string $modelClass, $id, callable $callback)
    {
        return DB::transaction(function () use ($modelClass, $id, $callback) {
            // Get and lock the specific row
            $model = $modelClass::where('id', $id)
                              ->lockForUpdate()
                              ->first();
            
            if (!$model) {
                throw new Exception("Record not found or has been deleted");
            }
            
            return $callback($model);
        });
    }

    /**
     * Execute with table-level advisory lock (for very critical operations)
     * 
     * @param string $lockName
     * @param callable $callback
     * @param int $timeout
     * @return mixed
     */
    public static function withAdvisoryLock(string $lockName, callable $callback, int $timeout = 10)
    {
        // Generate a numeric hash for the lock name (MySQL advisory locks need numeric keys)
        $lockKey = abs(crc32($lockName));
        
        try {
            // Acquire advisory lock
            $lockAcquired = DB::selectOne("SELECT GET_LOCK(?, ?) as acquired", [$lockKey, $timeout]);
            
            if (!$lockAcquired || $lockAcquired->acquired != 1) {
                throw new Exception("Could not acquire advisory lock '{$lockName}' within {$timeout} seconds");
            }
            
            // Execute callback
            return $callback();
            
        } finally {
            // Always release the lock
            try {
                DB::selectOne("SELECT RELEASE_LOCK(?) as released", [$lockKey]);
            } catch (Exception $e) {
                Log::warning("Failed to release advisory lock '{$lockName}': " . $e->getMessage());
            }
        }
    }

    /**
     * Bulk operation with chunking and safe transaction handling
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param callable $callback
     * @param int $chunkSize
     * @return array Results from each chunk
     */
    public static function bulkWithChunking($query, callable $callback, int $chunkSize = 100): array
    {
        $results = [];
        
        $query->chunk($chunkSize, function ($records) use ($callback, &$results) {
            $chunkResult = self::executeWithRetry(function () use ($records, $callback) {
                return $callback($records);
            });
            
            $results[] = $chunkResult;
        });
        
        return $results;
    }

    /**
     * Check if an exception is a deadlock or lock timeout
     * 
     * @param Throwable $e
     * @return bool
     */
    private static function isDeadlockOrLockTimeout(Throwable $e): bool
    {
        $message = $e->getMessage();
        
        // MySQL deadlock indicators
        $deadlockPatterns = [
            'Deadlock found when trying to get lock',
            'Lock wait timeout exceeded',
            'Transaction was deadlocked',
            'try restarting transaction'
        ];
        
        foreach ($deadlockPatterns as $pattern) {
            if (stripos($message, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Execute with optimistic locking check
     * 
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param int $expectedVersion
     * @param callable $callback
     * @return mixed
     */
    public static function withOptimisticLock($model, int $expectedVersion, callable $callback)
    {
        return DB::transaction(function () use ($model, $expectedVersion, $callback) {
            // Refresh and lock the model
            $current = $model::where('id', $model->id)
                           ->where('version', $expectedVersion)
                           ->lockForUpdate()
                           ->first();
            
            if (!$current) {
                throw new Exception(
                    "Concurrent modification detected. Expected version {$expectedVersion} but record was modified by another user."
                );
            }
            
            return $callback($current);
        });
    }

    /**
     * Log transaction performance for monitoring
     * 
     * @param string $operation
     * @param callable $callback
     * @return mixed
     */
    public static function withPerformanceLogging(string $operation, callable $callback)
    {
        $startTime = microtime(true);
        
        try {
            $result = $callback();
            
            $duration = round((microtime(true) - $startTime) * 1000, 2); // milliseconds
            
            if ($duration > 1000) { // Log slow transactions (> 1 second)
                Log::warning("Slow transaction detected", [
                    'operation' => $operation,
                    'duration_ms' => $duration
                ]);
            }
            
            return $result;
            
        } catch (Exception $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            Log::error("Transaction failed", [
                'operation' => $operation,
                'duration_ms' => $duration,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}
