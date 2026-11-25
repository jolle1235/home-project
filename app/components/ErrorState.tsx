import Button from "./Button";

type Props = {
  title: string;
  message: string;
  // Shows "Prøv igen" when given.
  onRetry?: () => void;
};

// The page body for an error or a missing page: what happened and the way back.
export default function ErrorState({ title, message, onRetry }: Props) {
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry}>
            Prøv igen
          </Button>
        )}
        <Button variant="secondary" href="/recipes">
          Til opskrifterne
        </Button>
      </div>
    </div>
  );
}
