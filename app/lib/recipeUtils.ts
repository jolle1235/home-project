import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

const databaseName = process.env.MONGO_DATABASE_NAME;

export interface Recipe {
  _id?: ObjectId;
  name: string;
  Items: string;
  instructions?: string;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const recipe = await db
      .collection<Recipe>('recipes')
      .findOne({ _id: new ObjectId(id) });
    return recipe;
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return null;
  }
}
