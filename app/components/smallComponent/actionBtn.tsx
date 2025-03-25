interface ActionBtnProps {
  onClickF: () => void; // Ensure it's a function
  Itext: string;
  textSize?: string;     // Optional text size class, e.g., "text-sm", "text-xl", etc.
}

export default function ActionBtn({ onClickF, Itext, textSize = "text-lg" }: ActionBtnProps) {
  return (
    <button 
      onClick={onClickF} 
      className={`flex justify-center items-center ${textSize} bg-action py-1 px-2 m-1 rounded-lg`}
    >
      {Itext}
    </button>
  );
}
