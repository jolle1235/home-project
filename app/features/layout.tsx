import NavBar from "../components/Navbar";
import { ConstantsProvider } from "../context/ConstantsContext";
import { RecipeProvider } from "../context/RecipeContext";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

// The app shell: data providers and navigation for every feature page. /login
// lives outside app/features, so it renders without them and their API calls.
export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <RecipeProvider>
        <ConstantsProvider>
          <NavBar />
          <main className="bg-background">{children}</main>
          <SpeedInsights />
        </ConstantsProvider>
      </RecipeProvider>
    </ReactQueryProvider>
  );
}
