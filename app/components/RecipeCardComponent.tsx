
import { Recipe } from "../model/Recipe";

async function getImageFromId(id: number){
  try {
    const response = await fetch(`/api/images/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to get Image with id: ${id}`);
    return response.json();
  } catch (error) {
    console.error('Error getting image:', error);
    throw error;
  }
}

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {

  if (!recipes || recipes.length === 0) {
    return <p>Der er i øjeblikket ingen opskrifter</p>;
  }



  return (
    <div id="recipes" className="flex flex-row flex-wrap">
      {recipes.map((recipe) => {
        return (
          <div key={recipe._id}>
            <div
              id="recipe_card"
              className="flex flex-col transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer justify-between max-w-md h-96 shadow-even shadow-darkBackground rounded-lg m-5"
            >
              <img
                src={recipe.image}
                alt={recipe.recipeName}
                className="object-cover rounded-t-lg h-64 w-80"
              ></img>

              <div className="flex flex-row mt-1">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    id="recipe_categories"
                    className="bg-darkgreyBackground font-bold m-2 p-2 rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div id="titel_and_price" className="flex flex-row">
                <p className="flex text-darkText text-lg pl-2 font-bold">
                  {recipe.recipeName}
                </p>
              </div>
              <div id="recipe_description" className="flex flex-row pb-2">
                <div id="time" className="flex flex-row items-center px-2">
                  <img
                    src="./icon/recipes_page/time.png"
                    alt="time"
                    className="flex size-5"
                  ></img>
                  <p className="flex text-darkgreyText">{recipe.time}</p>
                </div>
                <div
                  id="people"
                  className="flex flex-row space-x-1 ml-auto text-darkgreyText"
                >
                  <p>{recipe.recommendedPersonAmount}</p>
                  <p>personer</p>
                </div>
                <div
                  id="price_per_person"
                  className="flex px-2 pl-5 text-darkgreyText items-center"
                >
                  <img
                    src="./icon/recipes_page/person.png"
                    alt="person"
                    className="flex size-5"
                  ></img>
                  <div
                    id="price_per_person_text"
                    className="flex flex-row space-x-1"
                  >
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
