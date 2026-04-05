import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useRecordPageVisit } from "./hooks/useQueries";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ContactPage from "./pages/ContactPage";
import FreeTemplatesPage from "./pages/FreeTemplatesPage";
import HomePage from "./pages/HomePage";
import PoliciesPage from "./pages/PoliciesPage";
import TemplatesPage from "./pages/TemplatesPage";

function RootLayout() {
  const { mutate: recordVisit } = useRecordPageVisit();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = tz.split("/")[0] || "Unknown";
    recordVisit(country);
  }, [recordVisit]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates",
  component: TemplatesPage,
});
const freeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/free",
  component: FreeTemplatesPage,
});
const announcementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/announcements",
  component: AnnouncementsPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const policiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/policies",
  component: PoliciesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  templatesRoute,
  freeRoute,
  announcementsRoute,
  aboutRoute,
  contactRoute,
  adminRoute,
  policiesRoute,
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
