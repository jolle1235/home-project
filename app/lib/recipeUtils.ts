import clientPromise from './mongodb';
import { Recipe } from '../model/Recipe';

const databaseName = process.env.MONGO_DATABASE_NAME;

export async function getRecipes(author?: string): Promise<Recipe[]> {
  try {

    if (!databaseName) {
      throw new Error('MONGO_DATABASE_NAME is not defined');
    }
    
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    console.log("Connected to MongoDB");

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
      .limit(50)
      .toArray();


    return recipes;
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return [];
  }
}

