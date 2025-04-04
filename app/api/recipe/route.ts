import { NextResponse } from 'next/server';
import { getRecipes } from '../../lib/recipeUtils';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const author = url.searchParams.get('userName'); // Optional

    const recipes = await getRecipes(author || undefined);

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

