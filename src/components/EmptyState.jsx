import { AlertCircle } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-600 text-lg font-semibold">No recipes found</p>
      <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or adding more ingredients.</p>
    </div>
  );
}