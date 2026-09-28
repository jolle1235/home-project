import { NextResponse } from "next/server";
import { SafeFetchError, SafeFetchErrorCode } from "@/app/lib/safeFetch";
import { withScheme } from "@/app/utils/stringUtils";
import { scrapeRecipe } from "@/app/features/recipes/server/scrape";

const ERRORS: Record<SafeFetchErrorCode, { status: number; error: string }> = {
  invalid_url: { status: 400, error: "Linket er ikke gyldigt." },
  blocked: { status: 400, error: "Linket peger på en intern adresse." },
  http: { status: 502, error: "Siden svarede med en fejl." },
  not_found: { status: 422, error: "Siden findes ikke – tjek linket." },
  forbidden: { status: 422, error: "Siden tillader ikke automatisk hentning." },
  too_large: { status: 413, error: "Siden er for stor til at blive hentet." },
  timeout: { status: 504, error: "Siden svarede ikke i tide." },
  network: { status: 502, error: "Kunne ikke hente siden." },
};

export async function POST(req: Request) {
  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Ugyldig forespørgsel." },
      { status: 400 },
    );
  }

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json(
      { success: false, error: "Indsæt et link først." },
      { status: 400 },
    );
  }

  try {
    const recipe = await scrapeRecipe(withScheme(url));
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: "Fandt ingen opskrift på siden." },
        { status: 422 },
      );
    }
    return NextResponse.json({ success: true, partial: recipe.partial, recipe });
  } catch (err) {
    if (err instanceof SafeFetchError) {
      const { status, error } = ERRORS[err.code];
      return NextResponse.json({ success: false, error }, { status });
    }
    console.error("Recipe scrape failed:", err);
    return NextResponse.json(
      { success: false, error: "Noget gik galt under importen." },
      { status: 500 },
    );
  }
}
