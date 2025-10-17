export const detectIngredientsFromImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const base64Image = reader.result.split(',')[1];
        
        const response = await fetch(
          "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
          {
            method: "POST",
            headers: {
              "Authorization": `Key ${import.meta.env.VITE_CLARIFAI_PAT}`,
              "Content-Type": "appliction/json",
            },
            body: JSON.stringify({
              inputs: [{ data: { image: { base64: base64Image } } }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const concepts = data.outputs[0]?.data?.concepts || [];
        const detectedIngredients = concepts
          .filter(concept => concept.value > 0.5)
          .map(concept => concept.name.toLowerCase())
          .slice(0, 10);

        resolve(detectedIngredients);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };
  });
};