<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if ($permissions === []) {
            return $next($request);
        }

        $hasPermission = $user->role
            ? $user->role->permissions()->whereIn('name', $permissions)->exists()
            : false;

        if (! $hasPermission) {
            abort(403);
        }

        return $next($request);
    }
}
