import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Landing } from "./pages/Landing";
import { Detection } from "./pages/Detection";
import { History } from "./pages/History";
import { PlantLibrary } from "./pages/PlantLibrary";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";
import { PlantInfo } from "./pages/PlantInfo";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: "detection", Component: Detection },
      { path: "history", Component: History },
      { path: "dashboard", Component: Dashboard },
      { path: "library", Component: PlantLibrary},
      { path: "plant/:id", Component: PlantInfo},
      { path: "*", Component: NotFound },
    ],
  },
]);
