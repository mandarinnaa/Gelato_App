<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Display a listing of addresses.
     */
    public function index(Request $request)
    {
        $query = Address::with('user');
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $addresses = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $addresses
        ], 200);
    }

    /**
     * Get authenticated user's addresses.
     */
    public function myAddresses(Request $request)
    {
        $addresses = $request->user()->addresses;
        
        return response()->json([
            'success' => true,
            'data' => $addresses
        ], 200);
    }

    /**
     * Store a newly created address.
     */
    public function store(StoreAddressRequest $request)
    {
        $address = Address::create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Dirección creada exitosamente',
            'data' => $address
        ], 201);
    }

    /**
     * Display the specified address.
     */
    public function show(Address $address)
    {
        return response()->json([
            'success' => true,
            'data' => $address->load('user')
        ], 200);
    }

    /**
     * Update the specified address.
     */
    public function update(UpdateAddressRequest $request, Address $address)
    {
        $address->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Dirección actualizada exitosamente',
            'data' => $address
        ], 200);
    }

    /**
     * Remove the specified address.
     */
    public function destroy(Address $address)
    {
        $address->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Dirección eliminada exitosamente'
        ], 200);
    }
}