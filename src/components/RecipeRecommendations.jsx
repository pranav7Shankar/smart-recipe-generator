export default function RecipeRecommendations({ suggestions, onSelectRecipe }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">Recommended for You</h3>
      <p className="text-sm text-blue-700 mb-3">Based on your ratings</p>
      <div className="flex gap-2 overflow-x-auto">
        {suggestions.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap hover:bg-blue-700 transition"
          >
            {recipe.name}
          </button>
        ))}
      </div>
    </div>
  );
}