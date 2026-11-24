import { ConstantsProvider } from "../context/ConstantsContext";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import ServiceWorker from "../components/ServiceWorker";
import AppFrame from "../components/AppFrame";
import { SpeedInsights } from "@vercel/speed-insights/next";

// The app shell: data providers and navigation for every feature page. /login
// lives outside app/features, so it renders without them and their API calls.
export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ConstantsProvider>
        <AppFrame>{children}</AppFrame>
        <SpeedInsights />
        <ServiceWorker />
      </ConstantsProvider>
    </ReactQueryProvider>
  );
}
