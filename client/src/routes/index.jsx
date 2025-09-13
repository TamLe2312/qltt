import { useRoutes } from "react-router-dom";
import MainRoutes from "./mainRoutes";

// ==============================|| ROUTING RENDER ||============================== //

export default function Routes() {
  return useRoutes([MainRoutes]);
}
