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
        className="bg-transparent m-4 cursor-pointer transition-all duration-150 transform hover:scale-110 active:scale-95 active:opacity-80"
        aria-label={ariaLabel}
      >
        <img
          className="size-14 bg-action hover:bg-actionHover rounded-full transition-colors duration-150"
          src={iconSrc}
          alt={ariaLabel}
        />
      </button>
    </div>
  );
}
