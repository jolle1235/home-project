import { useState } from "react";
import { removeItem } from "@/app/utils/apiHelperFunctions";
import Image from "next/image";

interface RemoveButtonProps {
    itemName: string;
  onRemove?: () => void; // Optional callback to update UI
}

export function RemoveButton({ itemName, onRemove }: RemoveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    setLoading(true);
    setError(null);

    try {
      await removeItem(itemName);
      if (onRemove) onRemove();
    } catch (err) {
      setError("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400"
        onClick={handleRemove}
        disabled={loading}
      >
        <Image 
            src="/icon/remove_button.png"
            alt="Remove button"
            width={24} 
            height={24}
            />
      </button>
      {error && <p className="text-red-500 mt-1">{error}</p>}
    </div>
  );
}
