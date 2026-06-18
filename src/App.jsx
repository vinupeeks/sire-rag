import AppRoutes from './routes/AppRoutes';
import { Toaster } from "sonner";

function App() {
  // return <AppRoutes />;
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        closeButton
      />
    </>
  );
}

export default App;
