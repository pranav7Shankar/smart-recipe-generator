
export const filterRecipes = (recipes, filters) => {
  const { 
    selectedIngredients, 
    dietaryPrefs, 
    difficultyFilter, 
    maxCookTime, 
    servingsFilter 
  } = filters;

  let filtered = [...recipes];

  // Match ingredients
  if (selectedIngredients.length > 0) {
    filtered = filtered.map(recipe => {
      const matchCount = recipe.ingredients.filter(ing => 
        selectedIngredients.some(selected => 
          ing.toLowerCase().includes(selected.toLowerCase()) ||
          selected.toLowerCase().includes(ing.toLowerCase())
        )
      ).length;
      return { 
        ...recipe, 
        matchCount, 
        matchPercentage: (matchCount / recipe.ingredients.length) * 100 
      };
    }).sort((a, b) => b.matchCount - a.matchCount);
  }

  // Filter by dietary preferences
  if (dietaryPrefs.length > 0) {
    filtered = filtered.filter(recipe => 
      dietaryPrefs.every(pref => recipe.dietary.includes(pref))
    );
  }

  // Filter by difficulty
  if (difficultyFilter) {
    filtered = filtered.filter(recipe => recipe.difficulty === difficultyFilter);
  }

  // Filter by cook time
  if (maxCookTime < 120) {
    filtered = filtered.filter(recipe => recipe.cookTime <= maxCookTime);
  }

  // Filter by servings
  if (servingsFilter) {
    const servings = parseInt(servingsFilter);
    filtered = filtered.filter(recipe => recipe.servings === servings);
  }

  return filtered;
};

export const getMissingIngredients = (recipe, selectedIngredients) => {
  return recipe.ingredients.filter(ing => 
    !selectedIngredients.some(selected => 
      ing.toLowerCase().includes(selected.toLowerCase()) ||
      selected.toLowerCase().includes(ing.toLowerCase())
    )
  );
};

export const getRecipeSuggestions = (recipes, ratings) => {
  const ratedRecipes = recipes.filter(r => ratings[r.id] >= 4);
  if (ratedRecipes.length === 0) return [];
  
  const cuisines = [...new Set(ratedRecipes.map(r => r.cuisine))];
  const dietary = [...new Set(ratedRecipes.flatMap(r => r.dietary))];
  
  return recipes.filter(r => 
    !ratings[r.id] && 
    (cuisines.includes(r.cuisine) || r.dietary.some(d => dietary.includes(d)))
  ).slice(0, 3);
};