import { Item } from "../model/item";

// API client function
export async function searchItem(searchTerm: string): Promise<Item[]> {
  try {
    const response = await fetch(`/api/item?term=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
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
    if (!response.ok) throw new Error('Failed to create ingredient');
    return await response.json();
  } catch (error) {
    console.error('Error creating ingredient:', error);
    throw error;
  }
}
