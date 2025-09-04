"use client";

import { useEffect, useRef, useState } from "react";
import { AddButtonComponent } from "../components/AddButtonComponent";
import { AddDrinkModalComponent } from "../components/AddDrinkModalComponent";

export default function DrinkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  return (
    <main className="bg-lightgreyBackground text-darkText">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Drink</h1>
        <div></div>
        <AddButtonComponent
          onClick={() => {
            handleOpen();
          }}
        />
        {isModalOpen && <AddDrinkModalComponent handleClose={handleClose} />}
      </div>
    </main>
  );
}
