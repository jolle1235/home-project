import clientPromise from './mongodb';
import { Recipe } from '../model/Recipe';

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function getRecipes(author?: string): Promise<Recipe[]> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);

    // Build the query with $or
    const query: any = {
      $or: [{ isPublic: true }],
    };

    // If an author is provided, add it to the OR condition
    if (author) {
      query.$or.push({ author: author });
    }

    const recipes = await db
      .collection<Recipe>('recipes')
      .find(query)
      .toArray();

    return recipes;
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return [];
  }
}

