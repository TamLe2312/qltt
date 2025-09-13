import MainLayout from "../layouts/mainLayout";
import HomePage from "../pages/Home/homepage";
import NotFoundPage from "../pages/NotFound/404NotFound";
// import StaticPage from "~/pages/Static/StaticPage";

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "*",
      element: <NotFoundPage />,
    },
    {
      path: "",
      element: <HomePage />,
    },
    // {
    //   path: "static",
    //   children: [
    //     {
    //       path: ":slug",
    //       element: <StaticPage />,
    //     },
    //   ],
    // },
  ],
};

export default MainRoutes;
