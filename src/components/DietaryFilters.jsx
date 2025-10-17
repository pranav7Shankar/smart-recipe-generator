export default function DietaryFilters({ dietaryOptions, dietaryPrefs, onToggle }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Dietary Restrictions
      </label>
      <div className="flex flex-wrap gap-2">
        {dietaryOptions.map(pref => (
          <button
            key={pref}
            onClick={() => onToggle(pref)}
            className={`px-4 py-2 rounded-lg transition ${
              dietaryPrefs.includes(pref)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {pref}
          </button>
        ))}
      </div>
    </div>
  );
}