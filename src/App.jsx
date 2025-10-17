import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

// Import data
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
  // Initialize AWS Rekognition client
  const rekognitionClient = new RekognitionClient({
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });

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

  // Image upload handler with AWS Rekognition
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
      reader.readAsArrayBuffer(file);
      
      reader.onload = async () => {
        try {
          const imageBytes = new Uint8Array(reader.result);
          
          const command = new DetectLabelsCommand({
            Image: { Bytes: imageBytes },
            MaxLabels: 20,
            MinConfidence: 70
          });

          const data = await rekognitionClient.send(command);
          
          const ingredientMap = {
            'tomato': 'tomato', 'onion': 'onion', 'garlic': 'garlic',
            'potato': 'potato', 'carrot': 'carrot', 'broccoli': 'broccoli',
            'lettuce': 'lettuce', 'spinach': 'spinach', 'chicken': 'chicken',
            'beef': 'beef', 'pork': 'pork', 'fish': 'salmon',
            'salmon': 'salmon', 'shrimp': 'shrimp', 'egg': 'egg',
            'cheese': 'cheese', 'bread': 'bread', 'rice': 'rice',
            'pasta': 'pasta', 'mushroom': 'mushroom', 'pepper': 'bell pepper',
            'cucumber': 'cucumber', 'avocado': 'avocado', 'lemon': 'lemon',
            'corn': 'corn', 'bean': 'black beans', 'pea': 'peas',
            'basil': 'basil', 'ginger': 'ginger', 'butter': 'butter'
          };

          const labels = data.Labels || [];
          const detectedIngredients = [];
          
          labels.forEach(label => {
            const labelName = label.Name.toLowerCase();
            const confidence = label.Confidence;
            
            for (const [key, value] of Object.entries(ingredientMap)) {
              if (labelName.includes(key) && confidence > 70) {
                if (!detectedIngredients.includes(value)) {
                  detectedIngredients.push(value);
                }
                break;
              }
            }
          });

          if (detectedIngredients.length === 0) {
            setImageError("No ingredients detected. Try a clearer image or add manually.");
          } else {
            const newIngredients = [...selectedIngredients];
            detectedIngredients.slice(0, 10).forEach(ing => {
              if (!newIngredients.includes(ing)) {
                newIngredients.push(ing);
              }
            });
            setSelectedIngredients(newIngredients);
          }
          
          setIsProcessingImage(false);
        } catch (error) {
          console.error("AWS Rekognition error:", error);
          setImageError("Failed to analyze image. Check AWS credentials or try again.");
          setIsProcessingImage(false);
        }
      };

      reader.onerror = () => {
        setImageError("Failed to read image file.");
        setIsProcessingImage(false);
      };
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
        // ✅ keep only recipes with at least one matching ingredient
        .filter(recipe => recipe.matchCount > 0)
        // sort by best match first
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