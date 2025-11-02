"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Drink } from "@/app/model/Drink";
import ActionBtn from "@/app/components/smallComponent/actionBtn";

export default function DrinkDetailsPage() {
  const [drink, setDrink] = useState<Drink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchDrink = async () => {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      if (!id) {
        setError("No drink ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/drink/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch drink: ${errorText}`);
        }
        const data: Drink = await response.json();
        setDrink(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrink();
  }, [params.id]);

  async function deleteDrink() {
    if (!drink?._id) return;
    if (window.confirm("Er du sikker på, at du vil slette denne drink?")) {
      try {
        const res = await fetch(`/api/drink/${drink._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Kunne ikke slette drinken.");
        }
        // Redirect to drinks list or home after deletion
        window.location.href = "/drinks";
      } catch (err) {
        alert("Der opstod en fejl under sletning.");
      }
    }
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-x-hidden">
      <div className="flex flex-col md:w-1/2 w-full h-auto md:h-full p-3 justify-center items-center">
        <div className="flex flex-col items-center justify-center md:h-1/2 w-full m-2">
          <img
            className="w-full max-h-60 object-cover rounded-lg"
            src={drink?.image}
            alt={drink?.title}
          />
          <div className="flex flex-col items-center bg-lightgreyBackground rounded-lg p-2 mb-1 w-full">
            <h2 className="text-2xl font-bold text-center">{drink?.title}</h2>
          </div>
          <div className="flex flex-row w-full justify-around">
            <div className="flex flex-row w-fit justify-center items-center py-1 px-4 m-2 bg-lightgreyBackground h-12 rounded-full">
              <img
                src="/icon/recipes_page/time.png"
                alt="Time"
                className="h-6 mr-1"
              />
              <span className="text-lg">{drink?.time} min</span>
            </div>
            <div
              id="portion_div"
              className="flex flex-row w-fit h-12 justify-center items-center py-1 px-4 m-2 bg-lightgreyBackground space-x-2 rounded-full"
            >
              <img
                src="/icon/recipes_page/person.png"
                className="h-8"
                alt="Person icon"
              />
              <p className="flex w-8 h-8 rounded-lg items-center justify-center m-0 bg-white">
                {drink?.numberOfPeople}
              </p>
            </div>
          </div>
        </div>

        <div
          id="drink_ingredients"
          className="flex flex-col w-full h-auto md:h-full justify-between border-t border-darkgreyBackground"
        >
          <div className="flex flex-col w-full h-fit justify-start items-start">
            {drink?.ingredients.map((ingredient, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-row w-full h-fit justify-between items-center p-2 border-b border-darkgreyBackground"
                >
                  <input className="w-6 h-6 mr-4" type="checkbox" />
                  <div className="flex justify-start basis-1/4 flex-grow">
                    <p className="text-lg font-bold">{ingredient.item.name}</p>
                  </div>
                  <p className="flex justify-center items-center h-fit w-fit text-lg py-2 px-3 mx-2 bg-lightgreyBackground rounded-full">
                    {ingredient.quantity} {ingredient.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:w-1/2 w-full h-fit min-h-80 p-3">
        <div className="flex-1 rounded-lg p-5 bg-lightgreyBackground overflow-y-auto">
          <p className="whitespace-pre-line">{drink?.description}</p>
        </div>
      </div>
      <div className="flex flex-col md:w-1/2 w-full h-fit min-h-80 p-3">
        <div className="flex-1 rounded-lg p-5 bg-lightgreyBackground overflow-y-auto">
          <p className="whitespace-pre-line">{drink?.alternatives}</p>
        </div>
      </div>

      <ActionBtn
        onClickF={async () => {
          deleteDrink();
        }}
        Itext="Slet drink"
        color="bg-cancel"
        hover="bg-cancelHover"
      />
    </div>
  );
}
