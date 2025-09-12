"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Drink } from "@/app/model/Drink";

export function DrinkCardComponent({ drinks }: { drinks: Drink[] }) {
  const router = useRouter();

  if (!drinks || drinks.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500">
        Der er i øjeblikket ingen drinks
      </p>
    );
  }

  return (
    <div
      id="drinks"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
    >
      {drinks.map((drink) => {
        return (
          <div key={drink._id} className="w-full">
            <div
              id="drink_card"
              className="flex flex-col w-full h-fit shadow-even shadow-darkBackground rounded-lg mt-3 sm:mt-5 bg-neutral-100 cursor-pointer"
              onClick={() => router.push(`/drinks/${drink._id}`)}
            >
              <div className="relative w-full h-48 sm:h-64">
                <Image
                  src={drink.image}
                  alt={drink.title}
                  fill
                  className="object-cover rounded-t-lg"
                  priority
                />
              </div>

              <div id="titel_and_meta" className="flex flex-col p-2">
                <p className="truncate w-full text-darkText text-lg sm:text-xl font-bold">
                  {drink.title}
                </p>
                <div className="flex flex-row justify-between text-darkgreyText text-sm sm:text-base mt-1">
                  <div id="time" className="flex flex-row items-center">
                    <img
                      src="./icon/recipes_page/time.png"
                      alt="time"
                      className="flex size-4 sm:size-5 mx-1"
                    />
                    <p>{drink.time} min</p>
                  </div>
                  <div
                    id="people"
                    className="flex flex-row space-x-1 sm:space-x-2"
                  >
                    <p>{drink.numberOfPeople}</p>
                    <p>personer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
