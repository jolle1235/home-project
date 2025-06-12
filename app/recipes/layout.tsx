import { ReactNode } from "react";

export default async function RecipeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
