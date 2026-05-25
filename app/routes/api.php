<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ActiveMatchController;
use Illuminate\Support\Facades\Route;

Route::get('matches/active', [ActiveMatchController::class, 'show']);
Route::get('matches/active/stream', [ActiveMatchController::class, 'stream']);

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [ApiAuthController::class, 'register']);
        Route::post('login', [ApiAuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [ApiAuthController::class, 'me']);
            Route::post('logout', [ApiAuthController::class, 'logout']);
        });
    });
});
