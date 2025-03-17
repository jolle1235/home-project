'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Recipe {
  _id?: string; // MongoDB returnerer typisk en _id
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRecipe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });

    if (res.ok) {
      const savedRecipe: Recipe = await res.json();
      setRecipes((prev) => [...prev, savedRecipe]);
      setRecipe({ name: '', ingredients: '', instructions: '' });
      setMessage('Recipe saved successfully!');
    } else {
      setMessage('Failed to save recipe.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Recipe Collection</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Recipe Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="ingredients">Ingredients (comma separated):</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="instructions">Instructions:</label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save Recipe</button>
      </form>
      {message && <p>{message}</p>}
      <hr />
      <h2>Saved Recipes</h2>
      {recipes.length > 0 ? (
        <ul>
          {recipes.map((r) => (
            <li key={r._id}>
              <h3>{r.name}</h3>
              <p><strong>Ingredients:</strong> {r.ingredients}</p>
              {r.instructions && <p><strong>Instructions:</strong> {r.instructions}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes saved yet.</p>
      )}
    </div>
  );
}
