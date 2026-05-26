<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UploadController extends Controller
{
    /**
     * Upload a single image — converts to WebP via Cloudinary transformation.
     * Max 5 MB.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image'  => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',  // 5 MB
            'folder' => 'nullable|string|max:100',
        ]);
        try {
            $result = Cloudinary::upload($request->file('image')->getRealPath(), [
                'folder'         => $request->folder ?? 'ekta-digital/products',
                'transformation' => [
                    'quality'      => 'auto:best',
                    'fetch_format' => 'webp',   // always serve as WebP
                ],
            ]);
            return response()->json([
                'url'       => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'width'     => $result->getWidth(),
                'height'    => $result->getHeight(),
                'format'    => 'webp',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload multiple images — all converted to WebP.
     * Max 10 images, 5 MB each.
     */
    public function uploadImages(Request $request)
    {
        $request->validate([
            'images'   => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',  // 5 MB each
            'folder'   => 'nullable|string|max:100',
        ]);
        $folder  = $request->folder ?? 'ekta-digital/products';
        $results = [];
        foreach ($request->file('images') as $image) {
            try {
                $r         = Cloudinary::upload($image->getRealPath(), [
                    'folder'         => $folder,
                    'transformation' => ['quality' => 'auto:best', 'fetch_format' => 'webp'],
                ]);
                $results[] = [
                    'url'       => $r->getSecurePath(),
                    'public_id' => $r->getPublicId(),
                    'format'    => 'webp',
                ];
            } catch (\Exception $e) {
                $results[] = ['error' => $e->getMessage()];
            }
        }
        return response()->json(['images' => $results]);
    }

    /**
     * Upload a video — max 20 MB.
     */
    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video'  => 'required|mimes:mp4,mov,avi,webm|max:20480',   // 20 MB
            'folder' => 'nullable|string|max:100',
        ]);
        try {
            $result = Cloudinary::uploadVideo($request->file('video')->getRealPath(), [
                'folder'         => $request->folder ?? 'ekta-digital/videos',
                'transformation' => ['quality' => 'auto'],
            ]);
            return response()->json([
                'url'       => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Video upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload a hero slide image — optimised for full-width display.
     * Converted to WebP, max 5 MB.
     */
    public function uploadHeroImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',  // 5 MB
        ]);
        try {
            $result = Cloudinary::upload($request->file('image')->getRealPath(), [
                'folder'         => 'ekta-digital/hero-slides',
                'transformation' => [
                    'width'        => 1400,
                    'crop'         => 'limit',       // never upscale
                    'quality'      => 'auto:best',
                    'fetch_format' => 'webp',
                ],
            ]);
            return response()->json([
                'url'       => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'width'     => $result->getWidth(),
                'height'    => $result->getHeight(),
                'format'    => 'webp',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Hero image upload failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a Cloudinary asset.
     */
    public function delete(Request $request)
    {
        $request->validate([
            'public_id'     => 'required|string',
            'resource_type' => 'nullable|in:image,video',
        ]);
        try {
            Cloudinary::destroy($request->public_id, [
                'resource_type' => $request->resource_type ?? 'image',
            ]);
            return response()->json(['message' => 'Deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Delete failed: ' . $e->getMessage()], 500);
        }
    }
}
