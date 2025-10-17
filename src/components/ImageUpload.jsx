import { Camera, Upload, Loader, AlertCircle } from 'lucide-react';

export default function ImageUpload({ isProcessingImage, imageError, onImageUpload }) {
  return (
    <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="text-center">
        <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="font-semibold text-gray-700 mb-2">Upload Ingredient Photo</h3>
        <p className="text-sm text-gray-500 mb-3">AI will detect ingredients automatically</p>
        
        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            disabled={isProcessingImage}
          />
          <span className={`px-6 py-3 ${isProcessingImage ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg cursor-pointer inline-flex items-center gap-2 transition`}>
            {isProcessingImage ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Image...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Choose Image
              </>
            )}
          </span>
        </label>

        {imageError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{imageError}</p>
          </div>
        )}
      </div>
    </div>
  );
}