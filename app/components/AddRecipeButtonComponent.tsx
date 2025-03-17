import { useEffect, useState } from "react";
import { AddRecipeModalComponent } from "./AddRecipeModalComponent";

export function AddRecipeButtonComponent() {
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // open modal
  const handleOpen = () => {
    setIsModalOpen(true);
  };

  // close modal
  const handleClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      // Disable scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling when modal is closed
      document.body.style.overflow = "auto";
    }

    // Cleanup the effect when the component unmounts or when modal closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div
      id="add_recipe_button"
      className="fixed bottom-4 right-4 flex flex-row items-center group"
    >
      <span className="hidden group-hover:flex text-darkText font-bold text-lg">
        Add Recipe
      </span>
      <button onClick={handleOpen} className="bg-transparent m-4">
        <img
          className="size-14 bg-action hover:bg-actionHover rounded-full"
          src="/icon/add_sign.png"
          alt="add_recipe"
        />
      </button>
      {isModalOpen && (
        <AddRecipeModalComponent
          handleClose={handleClose}
        ></AddRecipeModalComponent>
      )}
    </div>
  );
}
