<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The recipient's own notification stream. There is no cross-user access here
 * at all — every query is rooted on the authenticated user, so no policy is
 * needed and none can be forgotten.
 */
class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->when($request->boolean('unread'), fn ($q) => $q->whereNull('read_at'))
            ->paginate(20);

        return response()->json([
            'data' => $notifications->through(fn ($n) => [
                'id' => $n->id,
                'key' => $n->data['key'] ?? null,
                'title' => $n->data['title'] ?? null,
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ])->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        // Scoped to the user's own notifications: an id from someone else's
        // stream is a 404, not a silent success.
        $request->user()->notifications()->findOrFail($notification)->markAsRead();

        return response()->json(null, 204);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(null, 204);
    }
}
