<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('order.{orderId}', function (User $user, int $orderId) {
    $order = Order::find($orderId);
    
    if (!$order) {
        return false;
    }

    return $user->id === $order->user_id || $user->id === $order->delivery_person_id;
});

Broadcast::channel('delivery-person.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
