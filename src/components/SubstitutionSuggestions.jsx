import { Lightbulb } from 'lucide-react';

export default function SubstitutionSuggestions({ 
  selectedIngredients, 
  showSubstitutions,
  onToggle,
  getSubstitutionsForIngredient 
}) {
  if (selectedIngredients.length === 0) return null;

  // Collect substitutions for each ingredient
  const substitutions = selectedIngredients.map(ing => ({
    ingredient: ing,
    subs: getSubstitutionsForIngredient(ing)
  }));

  // Check if there are any substitutions at all
  const hasAnySubstitutions = substitutions.some(item => item.subs.length > 0);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-yellow-900 font-semibold mb-2"
      >
        <Lightbulb className="w-5 h-5" />
        Ingredient Substitutions Available
      </button>

      {showSubstitutions && (
        <div className="space-y-2 mt-3">
          {hasAnySubstitutions ? (
            substitutions.map(({ ingredient, subs }) => {
              if (subs.length === 0) return null;
              return (
                <div key={ingredient} className="text-sm">
                  <span className="font-medium text-yellow-900">{ingredient}:</span>
                  <span className="text-yellow-700 ml-2">{subs.join(", ")}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-yellow-700 italic">
              No substitutions available for the selected ingredients.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
