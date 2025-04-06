import { useState, ChangeEvent, ClipboardEvent } from 'react';

interface ImageUploaderProps {
  onFileSelected: (file: File | null) => void;
}

export default function ImageUploader({ onFileSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pasteImageUrl, setPasteImageUrl] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelected(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    let handled = false;

    // Check for image file in clipboard
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          onFileSelected(file);
          setPreview(URL.createObjectURL(file));
          handled = true;
          e.preventDefault();
          break;
        }
      }
    }
    // If no image file was found, assume the user pasted a URL (or other text)
    if (!handled) {
      const text = e.clipboardData.getData("text");
      setPasteImageUrl(text);
      // If it's a valid URL, show it as a preview.
      if (text.startsWith("http")) {
        setPreview(text);
      }
    }
  };

  return (
    <div className='border-gray-200 border-2 rounded-lg p-2'>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label htmlFor="pasteInput" className="block font-bold">
          Or paste an image (or image URL) here:
        </label>
        <input 
          type="text" 
          id="pasteInput"
          placeholder="Paste here..."
          onPaste={handlePaste}
          value={pasteImageUrl}
          onChange={(e) => setPasteImageUrl(e.target.value)}
          className="border p-1 rounded mt-1 w-full"
        />
      </div>
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          style={{ width: '200px', marginTop: '10px' }} 
        />
      )}
    </div>
  );
}
