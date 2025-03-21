import { useState, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onFileSelected: (file: File | null) => void;
}

export default function ImageUploader({ onFileSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelected(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <img src={preview} alt="Preview" style={{ width: '200px', marginTop: '10px' }} />
      )}
    </div>
  );
}
