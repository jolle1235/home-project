interface ActionBtnProps {
  onClickF?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  Itext: string;
  textSize?: string;
  color?: string;
  hover?: string;
  extraCSS?: string;
  type?: "button" | "submit";
}

export default function ActionBtn({
  onClickF,
  Itext,
  textSize = "text-base sm:text-lg",
  color = "bg-action",
  hover = "bg-secondaryHover",
  extraCSS = "",
  type = "button",
}: ActionBtnProps) {
  return (
    <button
      onClick={onClickF}
      type={type}
      className={`flex justify-center items-center ${textSize} ${color} hover:${hover} ${extraCSS}  py-1 px-2 m-1 rounded-lg min-h-[36px] sm:min-h-[40px]`}
    >
      {Itext}
    </button>
  );
}
