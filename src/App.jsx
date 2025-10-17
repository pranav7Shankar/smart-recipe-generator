import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';


import { RECIPES, COMMON_INGREDIENTS, DIETARY_OPTIONS } from './data/recipes';
import { SUBSTITUTIONS } from './data/substitutions';

// Import components
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import IngredientInput from './components/IngredientInput';
import DietaryFilters from './components/DietaryFilters';
import AdvancedFilters from './components/AdvancedFilters';
import SubstitutionSuggestions from './components/SubstitutionSuggestions';
import RecipeRecommendations from './components/RecipeRecommendations';
import RecipeCard from './components/RecipeCard';
import EmptyState from './components/EmptyState';
import RecipeModal from './components/RecipeModal';
import Footer from './components/Footer';


export default function SmartRecipeGenerator() {

  // State management
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState(RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [ratings, setRatings] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [maxCookTime, setMaxCookTime] = useState(120);
  const [servingsFilter, setServingsFilter] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [showSubstitutions, setShowSubstitutions] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const saved = JSON.parse(window.savedData || '{"favorites":{},"ratings":{}}');
    setFavorites(saved.favorites || {});
    setRatings(saved.ratings || {});
  }, []);

  // Save data when favorites or ratings change
  useEffect(() => {
    window.savedData = JSON.stringify({ favorites, ratings });
  }, [favorites, ratings]);

  // Filter recipes when filters change
  useEffect(() => {
    filterRecipes();
  }, [selectedIngredients, dietaryPrefs, difficultyFilter, maxCookTime, servingsFilter]);

  // ✅ NEW: Image upload handler that calls the serverless API
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError("Please upload a valid image file (JPG, PNG)");
      return;
    }

    if (file.size > 5000000) {
      setImageError("Image too large. Please upload an image under 5MB.");
      return;
    }

    setIsProcessingImage(true);
    setImageError("");

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          // Extract base64 data (remove data:image/xxx;base64, prefix)
          const base64Data = reader.result.split(',')[1];
          
          console.log('Calling API with image data...');
          
          // Call the serverless API endpoint
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          console.log('API response status:', response.status);

          // Check if response has content
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Non-JSON response:", text);
            throw new Error("Server returned invalid response. Check Vercel logs.");
          }

          const data = await response.json();
          console.log('API response data:', data);

          if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze image');
          }

          if (data.success && data.ingredients && data.ingredients.length > 0) {
            const newIngredients = [...selectedIngredients];
            data.ingredients.slice(0, 10).forEach(ing => {
              if (!newIngredients.includes(ing)) {
                newIngredients.push(ing);
              }
            });
            setSelectedIngredients(newIngredients);
            setImageError(""); // Clear any previous errors
          } else {
            setImageError("No ingredients detected. Try a clearer image or add manually.");
          }
          
          setIsProcessingImage(false);
        } catch (error) {
          console.error("API error:", error);
          setImageError(error.message || "Failed to analyze image. Please try again.");
          setIsProcessingImage(false);
        }
      };

      reader.onerror = () => {
        setImageError("Failed to read image file.");
        setIsProcessingImage(false);
      };

      // Read file as Data URL (base64)
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setImageError("Failed to process image.");
      setIsProcessingImage(false);
    }
  };

  // Add ingredient
  const addIngredient = (ing) => {
    if (!ing.trim()) return;
    const ingredient = ing.toLowerCase().trim();
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Remove ingredient
  const removeIngredient = (ing) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ing));
  };

  // Toggle dietary preference
  const toggleDietary = (pref) => {
    setDietaryPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  // Filter recipes based on all criteria
  const filterRecipes = () => {
    try {
      let filtered = RECIPES;

      if (selectedIngredients.length > 0) {
        filtered = filtered
          .map(recipe => {
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
          })
          .filter(recipe => recipe.matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount);
      }

      if (dietaryPrefs.length > 0) {
        filtered = filtered.filter(recipe =>
          dietaryPrefs.every(pref => recipe.dietary.includes(pref))
        );
      }

      if (difficultyFilter) {
        filtered = filtered.filter(recipe => recipe.difficulty === difficultyFilter);
      }

      if (maxCookTime < 120) {
        filtered = filtered.filter(recipe => recipe.cookTime <= maxCookTime);
      }

      if (servingsFilter) {
        const servings = parseInt(servingsFilter);
        filtered = filtered.filter(recipe => recipe.servings === servings);
      }

      setFilteredRecipes(filtered);
    } catch (error) {
      console.error("Error filtering recipes:", error);
      setFilteredRecipes(RECIPES);
    }
  };

  // Toggle favorite
  const toggleFavorite = (recipeId) => {
    setFavorites(prev => ({...prev, [recipeId]: !prev[recipeId]}));
  };

  // Set rating
  const setRating = (recipeId, stars) => {
    setRatings(prev => ({...prev, [recipeId]: stars}));
  };

  const getMissingIngredients = (recipe) => {
    if (selectedIngredients.length === 0) return []; 
    return recipe.ingredients.filter(ing => 
      !selectedIngredients.some(selected => 
        ing.toLowerCase().includes(selected.toLowerCase()) ||
        selected.toLowerCase().includes(ing.toLowerCase())
      )
    );
  };

  // Get substitutions for an ingredient
  const getSubstitutionsForIngredient = (ingredient) => {
    const ing = ingredient.toLowerCase();
    for (const [key, subs] of Object.entries(SUBSTITUTIONS)) {
      if (ing.includes(key) || key.includes(ing)) {
        return subs;
      }
    }
    return [];
  };

  // Get recipe suggestions based on ratings
  const getSuggestions = () => {
    const ratedRecipes = RECIPES.filter(r => ratings[r.id] >= 4);
    if (ratedRecipes.length === 0) return [];
    
    const cuisines = [...new Set(ratedRecipes.map(r => r.cuisine))];
    const dietary = [...new Set(ratedRecipes.flatMap(r => r.dietary))];
    
    return RECIPES.filter(r => 
      !ratings[r.id] && 
      (cuisines.includes(r.cuisine) || r.dietary.some(d => dietary.includes(d)))
    ).slice(0, 3);
  };

  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <ImageUpload 
            isProcessingImage={isProcessingImage}
            imageError={imageError}
            onImageUpload={handleImageUpload}
          />
          
          <IngredientInput
            selectedIngredients={selectedIngredients}
            commonIngredients={COMMON_INGREDIENTS}
            onAdd={addIngredient}
            onRemove={removeIngredient}
          />
          
          <DietaryFilters
            dietaryOptions={DIETARY_OPTIONS}
            dietaryPrefs={dietaryPrefs}
            onToggle={toggleDietary}
          />
          
          <AdvancedFilters
            showFilters={showFilters}
            onToggleShow={() => setShowFilters(!showFilters)}
            difficultyFilter={difficultyFilter}
            onDifficultyChange={setDifficultyFilter}
            maxCookTime={maxCookTime}
            onTimeChange={setMaxCookTime}
            servingsFilter={servingsFilter}
            onServingsChange={setServingsFilter}
          />
        </div>

        <SubstitutionSuggestions
          selectedIngredients={selectedIngredients}
          showSubstitutions={showSubstitutions}
          onToggle={() => setShowSubstitutions(!showSubstitutions)}
          getSubstitutionsForIngredient={getSubstitutionsForIngredient}
        />

        <RecipeRecommendations
          suggestions={suggestions}
          onSelectRecipe={setSelectedRecipe}
        />

        {/* Loading State */}
        {isProcessingImage && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-orange-600 animate-spin" />
            <p className="text-gray-600">Analyzing your ingredients...</p>
          </div>
        )}

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredRecipes.map(recipe => {
              const missing = getMissingIngredients(recipe);
              const isFavorite = favorites[recipe.id];
              const userRating = ratings[recipe.id] || 0;
              
              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={isFavorite}
                  userRating={userRating}
                  onToggleFavorite={toggleFavorite}
                  onSetRating={setRating}
                  onViewRecipe={setSelectedRecipe}
                  missing={missing}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState />
        )}

        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          selectedIngredients={selectedIngredients}
          getSubstitutionsForIngredient={getSubstitutionsForIngredient}
        />
        <Footer/>
      </div>
    </div>
  );
}