import { ReactNode } from "react";
import ProtectedRoute from "../components/authentication/protectedPage";

export default async function WeekPlannerLayout({ children }: { children: ReactNode }) {


  return (
    <div>
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    </div>
  );
}
