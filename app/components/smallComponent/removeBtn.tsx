import Image from "next/image";
import React from "react";

/**
 * A styled red button with a remove icon.
 *
 * Props are the same style options as ActionBtn, but it always shows the remove icon.
 */
interface RemoveButtonProps {
  /** Function triggered when the button is clicked */
  onClickF?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;

  /** Tailwind classes for font size (default: "text-base sm:text-lg") */
  textSize?: string;

  /** Tailwind background color (default: "bg-cancel") */
  color?: string;

  /** Tailwind hover background color (default: "bg-cancelHover") */
  hover?: string;

  /** Any extra Tailwind classes for styling */
  extraCSS?: string;

  /** Button type (default: "button") */
  type?: "button" | "submit";
}

export function RemoveButton({
  onClickF,
  textSize = "text-base sm:text-lg",
  color = "bg-cancel",
  hover = "bg-cancelHover",
  extraCSS = "",
  type = "button",
}: RemoveButtonProps) {
  return (
    <button
      onClick={onClickF}
      type={type}
      className={`flex items-center px-2 py-1 text-white hover:bg-cancelHover disabled:bg-gray-400 transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 active:opacity-80 ${textSize} ${extraCSS} m-1 rounded-lg`}
    >
      <Image
        src="/icon/remove_button.png"
        alt="Remove button"
        width={20}
        height={20}
      />
    </button>
  );
}
