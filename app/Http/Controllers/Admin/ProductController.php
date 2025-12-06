<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Flavor;
use App\Models\Size;
use App\Models\Filling;
use App\Models\Topping;
use App\Models\BasePrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = Product::with(['flavor', 'size', 'filling', 'toppings'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('admin.products.index', compact('products'));
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        $flavors = Flavor::available()->get();
        $sizes = Size::available()->get();
        $fillings = Filling::available()->get();
        $toppings = Topping::available()->get();

        return view('admin.products.create', compact('flavors', 'sizes', 'fillings', 'toppings'));
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'flavor_id' => ['required', 'exists:flavors,id'],
            'size_id' => ['required', 'exists:sizes,id'],
            'filling_id' => ['nullable', 'exists:fillings,id'],
            'toppings' => ['nullable', 'array'],
            'toppings.*' => ['exists:toppings,id'],
            'available' => ['boolean'],
            'featured' => ['boolean'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        // Obtener el precio base
        $basePrice = BasePrice::where('flavor_id', $validated['flavor_id'])
            ->where('size_id', $validated['size_id'])
            ->first();

        if (!$basePrice) {
            return back()->withErrors(['error' => 'No existe un precio base para esta combinación de sabor y tamaño.']);
        }

        // Calcular precio final
        $finalPrice = $basePrice->price;

        if (!empty($validated['filling_id'])) {
            $filling = Filling::find($validated['filling_id']);
            $finalPrice += $filling->extra_price;
        }

        if (!empty($validated['toppings'])) {
            $toppingsPrice = Topping::whereIn('id', $validated['toppings'])->sum('extra_price');
            $finalPrice += $toppingsPrice;
        }

        // Manejar imagen si existe
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        // Crear producto
        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'flavor_id' => $validated['flavor_id'],
            'size_id' => $validated['size_id'],
            'filling_id' => $validated['filling_id'] ?? null,
            'base_price_id' => $basePrice->id,
            'final_price' => $finalPrice,
            'available' => $validated['available'] ?? true,
            'featured' => $validated['featured'] ?? false,
            'stock' => $validated['stock'],
        ]);

        // Asociar toppings
        if (!empty($validated['toppings'])) {
            $product->toppings()->attach($validated['toppings']);
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        $product->load(['flavor', 'size', 'filling', 'basePrice', 'toppings']);

        return view('admin.products.show', compact('product'));
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        $product->load('toppings');
        $flavors = Flavor::available()->get();
        $sizes = Size::available()->get();
        $fillings = Filling::available()->get();
        $toppings = Topping::available()->get();

        return view('admin.products.edit', compact('product', 'flavors', 'sizes', 'fillings', 'toppings'));
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'flavor_id' => ['required', 'exists:flavors,id'],
            'size_id' => ['required', 'exists:sizes,id'],
            'filling_id' => ['nullable', 'exists:fillings,id'],
            'toppings' => ['nullable', 'array'],
            'toppings.*' => ['exists:toppings,id'],
            'available' => ['boolean'],
            'featured' => ['boolean'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        // Obtener el precio base
        $basePrice = BasePrice::where('flavor_id', $validated['flavor_id'])
            ->where('size_id', $validated['size_id'])
            ->first();

        if (!$basePrice) {
            return back()->withErrors(['error' => 'No existe un precio base para esta combinación de sabor y tamaño.']);
        }

        // Calcular precio final
        $finalPrice = $basePrice->price;

        if (!empty($validated['filling_id'])) {
            $filling = Filling::find($validated['filling_id']);
            $finalPrice += $filling->extra_price;
        }

        if (!empty($validated['toppings'])) {
            $toppingsPrice = Topping::whereIn('id', $validated['toppings'])->sum('extra_price');
            $finalPrice += $toppingsPrice;
        }

        // Manejar imagen si existe
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior si existe
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // Actualizar producto
        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? $product->image,
            'flavor_id' => $validated['flavor_id'],
            'size_id' => $validated['size_id'],
            'filling_id' => $validated['filling_id'] ?? null,
            'base_price_id' => $basePrice->id,
            'final_price' => $finalPrice,
            'available' => $validated['available'] ?? true,
            'featured' => $validated['featured'] ?? false,
            'stock' => $validated['stock'],
        ]);

        // Sincronizar toppings
        $product->toppings()->sync($validated['toppings'] ?? []);

        return redirect()->route('admin.products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Eliminar imagen si existe
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }
}