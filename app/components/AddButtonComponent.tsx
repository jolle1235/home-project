"use client";

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  iconSrc?: string;
  ariaLabel?: string;
}

export function AddButtonComponent({
  onClick,
  label = "Add",
  iconSrc = "/icon/add_sign.png",
  ariaLabel = "add",
}: AddButtonProps) {
  return (
    <div
      id="add_button"
      className="fixed bottom-4 right-4 flex flex-row items-center group"
    >
      <span className="hidden group-hover:flex text-darkText font-bold text-lg">
        {label}
      </span>
      <button
        onClick={onClick}
        className="bg-transparent m-4"
        aria-label={ariaLabel}
      >
        <img
          className="size-14 bg-action hover:bg-actionHover rounded-full"
          src={iconSrc}
          alt={ariaLabel}
        />
      </button>
    </div>
  );
}
