interface ActionBtnProps {
  onClickF: () => void; // Ensure it's a function
  Itext: string;
  textSize?: string; 
  color?: string;
  hover?: string
}

export default function ActionBtn({ onClickF, Itext, textSize = "text-lg", color = "bg-action", hover = "bg-secondaryHover" }: ActionBtnProps) {
  return (
    <button 
      onClick={onClickF} 
      className={`flex  justify-center items-center ${textSize} ${color} hover:${hover} py-1 px-2 m-1 rounded-lg`}
    >
      {Itext}
    </button>
  );
}
