import { Outlet, useLocation } from "react-router";
import { Navbar } from "../navigation/Navbar";
import { ThemeProvider } from "next-themes";

export function RootLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        {!isAuthPage && <Navbar />}
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
