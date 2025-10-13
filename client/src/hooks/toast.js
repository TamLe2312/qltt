// eslint-disable-next-line import/no-extraneous-dependencies
import { Slide, toast } from "react-toastify";

export const handleToast = (type, mess) => {
  toast[type](mess, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
  });
};
