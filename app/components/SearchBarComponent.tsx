import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import { addToShoppingListSchema } from "../utils/validationSchema";

interface SearchBarProps {
  onChange: (value: string) => void;
  placeholder: string;
}

export function SearchBarComponent({ onChange, placeholder }: SearchBarProps) {
  const {
    setValue, // Add setValue to manage the value in React Hook Form
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(addToShoppingListSchema),
    mode: "onChange",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    setTimeout(() => {
      setValue("itemSearch", newValue); // Update React Hook Form's value
      trigger("itemSearch"); // Trigger validation after setting the value
    }, 100);
  }

  return (
    <div>
      <div className="relative w-full mx-auto">
        <input
          type="text"
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          className={`w-full p-3 pl-4 pr-12 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${errors.itemSearch ? "focus:ring-cancel" : ""}`}
        />
        {errors.itemSearch && getValues("itemSearch") && (
          <p className="text-red-500 absolute">{errors.itemSearch.message}</p>
        )}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.16-5.66a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default SearchBarComponent;
