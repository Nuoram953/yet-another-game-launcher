import * as React from "react";
import { createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Container } from "./components/new/layout/Container";
import { GlobalEventHandler } from "./components/GloabEventHandler";

import { Grid } from "./pages/grid/Index";
import { DetailPage } from "./feature/detail";
import { RankingPage } from "./pages/ranking/Index";
import { RankingEditPage } from "./pages/ranking/edit/Index";
import DownloadViewer from "./pages/download/Index";
import WebsiteViewer from "./pages/web/Index";
import { WishlistPage } from "./feature/wishlist";
import { SettingPage } from "./feature/settings";
import NotFound from "./pages/error/notFound";

/* ---------------- Root Route ---------------- */

const rootRoute = createRootRoute({
  component: () => (
    <Container>
      <GlobalEventHandler />
      <Outlet />
    </Container>
  ),
});

/* ---------------- Routes ---------------- */

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Grid,
  staticData: {
    breadcrumb: "Home",
  },
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/game/$id",
  component: DetailPage,
  loader: () => ({
    crumb: "Dashboard",
  }),
});

const rankingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ranking",
  component: RankingPage,
});

const rankingEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ranking/$id",
  component: RankingEditPage,
});

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  component: DownloadViewer,
});

const webRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/web",
  component: WebsiteViewer,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setting",
  component: SettingPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wishlist",
  component: WishlistPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});

/* ---------------- Route Tree ---------------- */

const routeTree = rootRoute.addChildren([
  indexRoute,
  gameRoute,
  rankingRoute,
  rankingEditRoute,
  downloadRoute,
  webRoute,
  settingsRoute,
  wishlistRoute,
  notFoundRoute,
]);

/* ---------------- Router ---------------- */

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

/* ---------------- Types ---------------- */

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
