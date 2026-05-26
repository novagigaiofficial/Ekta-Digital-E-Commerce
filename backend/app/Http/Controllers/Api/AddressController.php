<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller {
    public function index(Request $request) {
        return response()->json(
            Address::where('user_id', $request->user()->id)->orderByDesc('is_default')->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'label'        => 'nullable|string|max:50',
            'full_name'    => 'required|string|max:255',
            'phone'        => 'required|string|max:30',
            'address_line' => 'required|string|max:500',
            'city'         => 'required|string|max:100',
            'is_default'   => 'boolean',
        ]);
        // If this is default, clear any existing default for this user
        if ($request->boolean('is_default')) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }
        $address = Address::create([
            'user_id'      => $request->user()->id,
            'label'        => $request->label ?? 'Home',
            'full_name'    => $request->full_name,
            'phone'        => $request->phone,
            'address_line' => $request->address_line,
            'city'         => $request->city,
            'is_default'   => $request->boolean('is_default'),
        ]);
        return response()->json($address, 201);
    }

    public function destroy(Request $request, $id) {
        Address::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Address deleted']);
    }
}
