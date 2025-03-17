'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { AddRecipeButtonComponent } from '../components/AddRecipeButtonComponent';

interface Recipe {
  _id?: string; // Optional for new recipes
  name: string;
  ingredients: string;
  instructions?: string;
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe>({ name: '', ingredients: '', instructions: '' });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Fetch recipes when the component mounts
    fetch('/api/recipe')
      .then((res) => res.json())
      .then((data: Recipe[]) => setRecipes(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Opskrifter</h1>
      {recipes.length > 0 ? (
        <ul>
          {recipes.map((r, index) => (
            <li key={r._id || `recipe-${index}`}>
              <h3>{r.name}</h3>
              <p><strong>Ingredients:</strong> {r.ingredients}</p>
              {r.instructions && <p><strong>Instructions:</strong> {r.instructions}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes saved yet.</p>
      )}
      <AddRecipeButtonComponent />
    </div>
  );
}
