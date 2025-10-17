import { Filter } from 'lucide-react';

export default function AdvancedFilters({ 
  showFilters, 
  onToggleShow,
  difficultyFilter, 
  onDifficultyChange,
  maxCookTime, 
  onTimeChange,
  servingsFilter, 
  onServingsChange 
}) {
  return (
    <>
      <button
        onClick={onToggleShow}
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition"
      >
        <Filter className="w-5 h-5" />
        {showFilters ? 'Hide Filters' : 'Show More Filters'}
      </button>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Cook Time: {maxCookTime}min
            </label>
            <input
              type="range"
              min="10"
              max="120"
              value={maxCookTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
            <select
              value={servingsFilter}
              onChange={(e) => onServingsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}