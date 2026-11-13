import { withSession } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import {
  getShoppingList,
  saveShoppingList,
  clearShoppingList,
} from "../../features/shoppingList/server/shoppinglist.server";

async function handleGet() {
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

async function handlePut(request: NextRequest) {
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

async function handleDelete() {
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

export const GET = withSession(handleGet);
export const PUT = withSession(handlePut);
export const DELETE = withSession(handleDelete);
