import { Item } from "../model/Item";

// API client function
export async function searchItem(searchTerm: string): Promise<Item[]> {
  try {
    const response = await fetch(`/api/item?term=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Failed to fetch Items');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching Items:', error);
    return [];
  }
}

export async function createItem(item: Item): Promise<Item> {
  try {
    const response = await fetch('/api/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create Item');
    return await response.json();
  } catch (error) {
    console.error('Error creating Item:', error);
    throw error;
  }
}

export async function removeItem(itemName: string): Promise<void> {
  try {
    const response = await fetch("/api/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: itemName }), // Send name instead of ID
    });

    if (!response.ok) throw new Error("Failed to remove item");

    console.log(`Item '${itemName}' removed successfully`);
  } catch (error) {
    console.error("Error removing item:", error);
    throw error;
  }
}



