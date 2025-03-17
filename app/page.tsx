import Button from '@/app/components/homePageNavigationBtn';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to My Recipe App</h1>
      <p className="text-lg text-gray-700 mb-6">Discover and save your favorite recipes!</p>
      <Button href="/recipes">Go to Recipes</Button>
    </div>
  );
}