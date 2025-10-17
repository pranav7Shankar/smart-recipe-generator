import { Heart, Clock, Users, Star } from 'lucide-react';

export default function RecipeCard({ 
  recipe, 
  isFavorite, 
  userRating,
  onToggleFavorite,
  onSetRating,
  onViewRecipe,
  missing 
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="text-5xl mb-2">{recipe.image}</div>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className={`${isFavorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600 transition`}
          >
            <Heart className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{recipe.cuisine} • {recipe.difficulty}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.cookTime}min
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </div>
        </div>

        {recipe.matchCount > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-green-700 mb-1">
              {recipe.matchCount}/{recipe.ingredients.length} ingredients matched
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${recipe.matchPercentage}%` }}
              />
            </div>
          </div>
        )}

        {missing.length > 0 && missing.length <= 3 && (
          <div className="text-xs text-orange-600 mb-3">
            Missing: {missing.join(", ")}
          </div>
        )}

        {recipe.dietary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.dietary.map(d => (
              <span key={d} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded p-3 mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">Nutrition (per serving)</div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>{recipe.nutrition.calories} cal</div>
            <div>{recipe.nutrition.protein}g protein</div>
            <div>{recipe.nutrition.carbs}g carbs</div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => onSetRating(recipe.id, star)}
              className={`${
                star <= userRating ? 'text-yellow-500' : 'text-gray-300'
              } hover:text-yellow-500 transition`}
            >
              <Star className="w-5 h-5" fill={star <= userRating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>

        <button
          onClick={() => onViewRecipe(recipe)}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}