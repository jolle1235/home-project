import { yupResolver } from "@hookform/resolvers/yup";
import React, { type RefObject } from "react";
import { useForm } from "react-hook-form";
import { addToShoppingListSchema } from "../utils/validationSchema";

interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}
export function SearchBarComponent({
  value,
  onChange,
  inputRef,
  onKeyDown,
  ...rest
}: SearchBarProps) {
  const {
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(addToShoppingListSchema),
    mode: "onChange",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;

    onChange(newValue);
    setValue("itemSearch", newValue);
    trigger("itemSearch");
  }

  return (
    <div className="w-full">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          ref={inputRef}
          onKeyDown={onKeyDown}
          {...rest}
          className={`w-full p-2 sm:p-3 pl-3 sm:pl-4 pr-10 sm:pr-12 border rounded-lg text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary
  ${errors.itemSearch ? "focus:ring-cancel" : ""}`}
        />

        <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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

      {errors.itemSearch && value && (
        <p className="text-red-500 text-sm sm:text-base mt-1">
          {errors.itemSearch.message}
        </p>
      )}
    </div>
  );
}
