import React from "react";
import Routes from "./Routes";
import { ToastContainer } from "./components/ui/Toast";
import { useToast } from "./hooks/useToast";

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}

export default App;
