import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Landing } from "./pages/Landing";
import { Detection } from "./pages/Detection";
import { History } from "./pages/History";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: "detection", Component: Detection },
      { path: "history", Component: History },
      { path: "dashboard", Component: Dashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
