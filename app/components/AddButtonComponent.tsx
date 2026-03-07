import Button from "./smallComponent/Button";
import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  iconSrc?: string;
  ariaLabel?: string;
}

export function AddButtonComponent({
  onClick,
  label = "Add",
  ariaLabel = "add",
}: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="primary"
      size="lg"
      aria-label={ariaLabel}
      className="rounded-full shadow-lg min-h-[48px] px-5"
    >
      <Plus className="w-5 h-5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
