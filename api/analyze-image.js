/* eslint-env node */
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

// Force Node.js runtime for Buffer and process support
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Log request for debugging (check Vercel logs)
    console.log('Request received:', {
      method: req.method,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({ 
        success: false,
        error: 'Request body is empty' 
      });
    }

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        success: false,
        error: 'No image data provided. Include "imageBase64" in request body.' 
      });
    }

    // Get environment variables
    const awsRegion = process.env.VITE_AWS_REGION || 'us-east-1';
    const awsAccessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;

    // Validate AWS credentials are configured
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error('AWS credentials missing!');
      return res.status(500).json({ 
        success: false,
        error: 'AWS credentials not configured',
        details: 'Set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY in Vercel environment variables'
      });
    }

    console.log('Initializing AWS Rekognition client...');

    // Initialize AWS Rekognition client
    const rekognitionClient = new RekognitionClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });

    // Convert base64 to Buffer (Node.js built-in)
    const imageBytes = Buffer.from(imageBase64, 'base64');
    console.log('Image bytes length:', imageBytes.length);

    // Create the Rekognition command
    const command = new DetectLabelsCommand({
      Image: { Bytes: imageBytes },
      MaxLabels: 20,
      MinConfidence: 70
    });

    console.log('Sending request to AWS Rekognition...');

    // Send command to AWS Rekognition
    const data = await rekognitionClient.send(command);
    
    console.log('AWS Rekognition response received:', {
      labelCount: data.Labels?.length || 0
    });

    // Ingredient mapping - maps AWS labels to common ingredient names
    const ingredientMap = {
      'tomato': 'tomato',
      'onion': 'onion',
      'garlic': 'garlic',
      'potato': 'potato',
      'carrot': 'carrot',
      'broccoli': 'broccoli',
      'lettuce': 'lettuce',
      'spinach': 'spinach',
      'chicken': 'chicken',
      'beef': 'beef',
      'pork': 'pork',
      'fish': 'salmon',
      'salmon': 'salmon',
      'shrimp': 'shrimp',
      'egg': 'egg',
      'cheese': 'cheese',
      'bread': 'bread',
      'rice': 'rice',
      'pasta': 'pasta',
      'mushroom': 'mushroom',
      'pepper': 'bell pepper',
      'cucumber': 'cucumber',
      'avocado': 'avocado',
      'lemon': 'lemon',
      'corn': 'corn',
      'bean': 'black beans',
      'pea': 'peas',
      'basil': 'basil',
      'ginger': 'ginger',
      'butter': 'butter',
      'cabbage': 'cabbage',
      'celery': 'celery',
      'eggplant': 'eggplant',
      'zucchini': 'zucchini',
      'squash': 'squash',
      'cauliflower': 'cauliflower',
      'kale': 'kale',
      'apple': 'apple',
      'banana': 'banana',
      'orange': 'orange',
      'strawberry': 'strawberry',
      'blueberry': 'blueberry',
      'grape': 'grapes',
      'watermelon': 'watermelon',
      'pineapple': 'pineapple',
      'mango': 'mango',
      'peach': 'peach',
      'pear': 'pear'
    };

    const labels = data.Labels || [];
    const detectedIngredients = [];

    // Process each label and map to ingredients
    labels.forEach(label => {
      const labelName = label.Name.toLowerCase();
      const confidence = label.Confidence;

      // Check if label matches any ingredient in our map
      for (const [key, value] of Object.entries(ingredientMap)) {
        if (labelName.includes(key) && confidence > 70) {
          if (!detectedIngredients.includes(value)) {
            detectedIngredients.push(value);
          }
          break; // Stop after first match
        }
      }
    });

    console.log('Detected ingredients:', detectedIngredients);

    // Return successful response
    return res.status(200).json({
      success: true,
      ingredients: detectedIngredients,
      labels: labels.map(l => ({ 
        name: l.Name, 
        confidence: l.Confidence 
      })),
      message: detectedIngredients.length > 0 
        ? `Found ${detectedIngredients.length} ingredient(s)` 
        : 'No ingredients detected'
    });

  } catch (error) {
    // Log error details for debugging
    console.error("AWS Rekognition error:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      details: error.message,
      errorType: error.name
    });
  }
}