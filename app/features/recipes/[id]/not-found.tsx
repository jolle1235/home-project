import ErrorState from "../../../components/ErrorState";

// A missing recipe or an id that isn't one.
export default function RecipeNotFound() {
  return (
    <ErrorState
      title="Opskriften findes ikke"
      message="Den er måske blevet slettet, eller linket er forkert."
    />
  );
}
