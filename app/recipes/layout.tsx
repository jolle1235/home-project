import { ReactNode } from "react";

export default async function RecipeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="bg-lightBackground p-6 w-full h-full">{children}</div>;
}
