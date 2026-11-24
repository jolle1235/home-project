import NavBar from "./Navbar";

// The page's main content; the skip link jumps here.
const MAIN_ID = "indhold";

// The navigation and the main content area of every page that has the navigation. The skip
// link is the first Tab stop and jumps past the navigation.
export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href={`#${MAIN_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-floating"
      >
        Spring til indhold
      </a>
      <NavBar />
      <main id={MAIN_ID} tabIndex={-1} className="bg-background outline-none">
        {children}
      </main>
    </>
  );
}
