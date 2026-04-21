import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, LocaleProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { system } from "./theme";
import "./theme/animations.css";
import { AuthProvider } from "./lib/auth-context";
import { GOOGLE_CLIENT_ID } from "./lib/config";
import { App } from "./App";
import { Toaster } from "./components/Toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ChakraProvider value={system}>
        <LocaleProvider locale="he-IL">
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <App />
                <Toaster />
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </LocaleProvider>
      </ChakraProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
