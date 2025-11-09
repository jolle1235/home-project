interface ActionBtnProps {
  onClickF?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  Itext: string;
  textSize?: string;
  color?: string;
  hover?: string;
  extraCSS?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export default function ActionBtn({
  onClickF,
  Itext,
  textSize = "text-base sm:text-lg",
  color = "bg-action",
  hover = "bg-secondaryHover",
  extraCSS = "",
  type = "button",
  disabled = false,
  isLoading = false,
  loadingText = "Indlæser...",
}: ActionBtnProps) {
  return (
    <button
      onClick={onClickF}
      type={type}
      disabled={disabled || isLoading}
      className={`flex justify-center items-center ${textSize} ${color} hover:${hover} active:scale-98 active:opacity-80 transition-all duration-150 cursor-pointer transform hover:scale-105 ${extraCSS}  py-1 px-2 m-1 rounded-lg min-h-[36px] sm:min-h-[40px] disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-darkText"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{loadingText}</span>
        </div>
      ) : (
        Itext
      )}
    </button>
  );
}
