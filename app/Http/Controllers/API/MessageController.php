<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Order $order)
    {
        // Verificar que el usuario tenga permiso para ver los mensajes de esta orden
        $user = Auth::user();
        if ($user->id !== $order->user_id && $user->id !== $order->delivery_person_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $order->messages()->with('sender')->get();
    }

    public function store(Request $request, Order $order)
    {
        $user = Auth::user();
        
        // Verificar permisos
        if ($user->id !== $order->user_id && $user->id !== $order->delivery_person_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $message = $order->messages()->create([
            'sender_id' => $user->id,
            'content' => $request->content,
        ]);

        // Cargar la relación sender para el evento
        $message->load('sender');

        broadcast(new MessageSent($message));

        return response()->json($message, 201);
    }
}
