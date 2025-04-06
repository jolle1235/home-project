
import Image from "next/image";

interface RemoveButtonProps {
  onRemove?: () => void; // Optional callback to update UI
}

export function RemoveButton({ onRemove }: RemoveButtonProps) {

  const handleRemove = async () => {
    if(onRemove){onRemove()}
  };

  return (
    <div>
      <button
        className="flex items-center px-2 py-1 text-white rounded hover:bg-red-200 disabled:bg-gray-400"
        onClick={handleRemove}
      >
        <Image 
            src="/icon/remove_button.png"
            alt="Remove button"
            width={24} 
            height={24}
            />
      </button>
    </div>
  );
}
