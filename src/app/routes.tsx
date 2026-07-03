import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Landing } from "./pages/Landing";
import { Detection } from "./pages/Detection";
import { History } from "./pages/History";
import { PlantLibrary } from "./pages/PlantLibrary";
import { PlantInfo } from "./pages/PlantInfo";
import { DiseaseInfo } from "./pages/DiseaseInfo";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: "detection", Component: Detection },
      { path: "history", Component: History },
      { path: "library", Component: PlantLibrary },
      { path: "plant/:id", Component: PlantInfo },
      { path: "disease/:id", Component: DiseaseInfo },
      { path: "dashboard", Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
]);
