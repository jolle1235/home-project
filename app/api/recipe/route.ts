import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';


interface Recipe {
  name: string;
  ingredients: string;
  instructions?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db('recipeDB');

  if (req.method === 'POST') {
    const recipe: Recipe = req.body;

    if (!recipe.name || !recipe.ingredients) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const result = await db.collection('recipes').insertOne(recipe);
      res.status(201).json({ ...recipe, _id: result.insertedId });
    } catch (error) {
      res.status(500).json({ error: 'Error saving recipe' });
    }
  } else if (req.method === 'GET') {
    try {
      const recipes = await db.collection('recipes').find({}).toArray();
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching recipes' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
