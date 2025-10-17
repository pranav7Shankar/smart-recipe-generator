import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function IngredientInput({ 
  selectedIngredients, 
  commonIngredients, 
  onAdd, 
  onRemove 
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Or Add Ingredients Manually
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Type ingredient..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Add
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {commonIngredients.map(ing => (
          <button
            key={ing}
            onClick={() => onAdd(ing)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition"
          >
            {ing}
          </button>
        ))}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map(ing => (
            <span key={ing} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center gap-2">
              {ing}
              <X className="w-4 h-4 cursor-pointer" onClick={() => onRemove(ing)} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}