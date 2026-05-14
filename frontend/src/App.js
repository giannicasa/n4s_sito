import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

import LenisProvider from "./components/LenisProvider";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import AIChat from "./components/AIChat";
import CustomCursor from "./components/CustomCursor";
import PageWrap from "./components/PageWrap";

import HomePage from "./pages/HomePage";
import ServicesHubPage from "./pages/ServicesHubPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import ChiSiamoPage from "./pages/ChiSiamoPage";
import ContattiPage from "./pages/ContattiPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LenisProvider>
          <div className="App min-h-screen bg-black text-white selection:bg-violet-500">
            <CustomCursor />
            <Nav />
            <main>
              <PageWrap>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/servizi" element={<ServicesHubPage />} />
                  <Route path="/servizi/:slug" element={<ServiceDetailPage />} />
                  <Route path="/case-studies" element={<CaseStudiesPage />} />
                  <Route path="/chi-siamo" element={<ChiSiamoPage />} />
                  <Route path="/contatti" element={<ContattiPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </PageWrap>
            </main>
            <Footer />
            <AIChat />
            <Toaster
              theme="dark"
              richColors
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "#0a0a0a",
                  color: "#ffffff",
                  border: "1px solid rgba(157,76,221,0.4)",
                  borderRadius: "2px",
                  fontFamily: "Satoshi, system-ui, sans-serif"
                }
              }}
            />
          </div>
        </LenisProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
