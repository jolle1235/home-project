import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link className="text-white" href="/recipes">Opskrifter</Link>
          <Link className="text-white" href="/weekPlanner">Madplan</Link>
          <Link className="text-white" href="/shoppinglist">Indkøbsliste</Link>
        </div>
      </div>
    </nav>
  );
}
