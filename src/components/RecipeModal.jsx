import { X, Clock, Users, ChefHat, Lightbulb } from 'lucide-react';

export default function RecipeModal({ 
  recipe, 
  onClose, 
  selectedIngredients,
  getSubstitutionsForIngredient 
}) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-6xl mb-3">{recipe.image}</div>
              <h2 className="text-3xl font-bold text-gray-800">{recipe.name}</h2>
              <p className="text-gray-600">{recipe.cuisine} Cuisine</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <div className="text-sm font-semibold">{recipe.cookTime} min</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-semibold">{recipe.servings} servings</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <ChefHat className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <div className="text-sm font-semibold">{recipe.difficulty}</div>
            </div>
          </div>

          {recipe.dietary.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {recipe.dietary.map(d => (
                  <span key={d} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => {
                const hasIt = selectedIngredients.some(selected => 
                  ing.toLowerCase().includes(selected.toLowerCase()) ||
                  selected.toLowerCase().includes(ing.toLowerCase())
                );
                const subs = getSubstitutionsForIngredient(ing);
                return (
                  <li key={idx} className="border-b border-gray-100 pb-2">
                    <div className={`flex items-center gap-2 ${hasIt ? 'text-green-700' : 'text-gray-700'}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span className="font-medium">{ing}</span>
                      {hasIt && <span className="text-xs bg-green-100 px-2 py-0.5 rounded">(✓ have it)</span>}
                    </div>
                    {!hasIt && subs.length > 0 && (
                      <div className="ml-4 mt-1 text-xs text-yellow-700 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Can substitute with: {subs.join(", ")}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Nutrition Information (per serving)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.fat}g</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}