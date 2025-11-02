import { useState, ChangeEvent, ClipboardEvent, useEffect } from "react";
import ActionBtn from "./smallComponent/actionBtn";

interface ImageUploaderProps {
  onFileSelected: (file: File | null) => void;
  initialPreview?: string;
}

export default function ImageUploader({
  onFileSelected,
  initialPreview,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelected(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onFileSelected(null); // clear the file in parent
  };

  return (
    <div className="flex flex-col items-center">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover mb-2"
        />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <ActionBtn
          type="button"
          onClickF={handleClear}
          Itext="Fjern billede"
          color="bg-cancel"
          hover="bg-cancelHover"
        />
      )}
    </div>
  );
}
