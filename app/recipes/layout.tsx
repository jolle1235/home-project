import { ReactNode } from "react";

export default async function RecipeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="bg-background p-1 w-full h-full">{children}</div>;
}
