
import { Recipe } from "../model/Recipe";

export function RecipeCardComponent({ recipes }: { recipes: Recipe[] }) {

  if (!recipes || recipes.length === 0) {
    return <p>Der er i øjeblikket ingen opskrifter</p>;
  }

  return (
    <div id="recipes" className="flex flex-row flex-wrap space-x-4">
      {recipes.map((recipe) => {
        return (
          <div key={recipe._id}>
            <div
              id="recipe_card"
              className="flex flex-col transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer max-w-md h-fit shadow-even shadow-darkBackground rounded-lg mt-5 bg-neutral-100"
            >
              <img
                src={recipe.image}
                alt={recipe.recipeName}
                className="object-cover rounded-t-lg h-64 w-80"
              ></img>

              <div className="flex flex-row">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    id="recipe_categories"
                    className="bg-darkgreyBackground font-bold p-1.5 m-1 rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div id="titel_and_price" className="flex flex-row">
                <p className="flex text-darkText text-2xl pl-2 font-bold">
                  {recipe.recipeName}
                </p>
              </div>
              <div id="recipe_description" className="flex flex-row pb-2">
                <div id="time" className="flex flex-row items-center px-2">
                  <img
                    src="./icon/recipes_page/time.png"
                    alt="time"
                    className="flex size-5 mx-1"
                  ></img>
                  <p className="flex text-darkgreyText">{recipe.time}</p>
                </div>
                <div
                  id="people"
                  className="flex flex-row space-x-2 ml-auto text-darkgreyText"
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
