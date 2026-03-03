import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LoginForm from './components/login-form';
import Register from './components/Register';

const router = createBrowserRouter([
  {
    // The main parent route. Everything inside 'children' will render inside MainLayout's <Outlet />
    path: "/",
    element: <MainLayout />, // main layout appears in every page
    children: [
      {
        index: true, // home page at '/'
        element: <Home />,
      },
      {
        path: "login", // Loads at "/login"
        element: <LoginForm />,
      },
      {
        path: "register", // Loads at "/register"
        element: <Register />,
      },
      //{
        //path: "category/:categoryName",
        //element: <CategoryPage />,
      //}
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
