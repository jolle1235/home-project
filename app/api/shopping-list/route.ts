import { NextRequest, NextResponse } from "next/server";

import {
  getShoppingList,
  saveShoppingList,
  clearShoppingList,
} from "../../features/shoppingList/server/shoppinglist.server";

export async function GET() {
  try {
    const shoppingList = await getShoppingList();

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch shopping list",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const items = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          error: "Shopping list must be an array",
        },
        {
          status: 400,
        },
      );
    }

    await saveShoppingList(items);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save shopping list",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE() {
  try {
    await clearShoppingList();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to clear shopping list",
      },
      {
        status: 500,
      },
    );
  }
}
