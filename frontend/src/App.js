import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import QuoteCalculatorPage from "./pages/QuoteCalculatorPage";
import InsightsHubPage from "./pages/InsightsHubPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <LenisProvider>
        <div className="App min-h-screen bg-black text-white selection:bg-violet-500">
          <CustomCursor />
          <Nav />
          <main>
            <PageWrap>
              <Routes>
                {/* Italian (default) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/servizi" element={<ServicesHubPage />} />
                <Route path="/servizi/:slug" element={<ServiceDetailPage />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/chi-siamo" element={<ChiSiamoPage />} />
                <Route path="/contatti" element={<ContattiPage />} />
                <Route path="/preventivo" element={<QuoteCalculatorPage />} />
                <Route path="/insights" element={<InsightsHubPage />} />
                <Route path="/insights/:slug" element={<InsightDetailPage />} />

                {/* English */}
                <Route path="/en" element={<HomePage />} />
                <Route path="/en/services" element={<ServicesHubPage />} />
                <Route path="/en/services/:slug" element={<ServiceDetailPage />} />
                <Route path="/en/case-studies" element={<CaseStudiesPage />} />
                <Route path="/en/about" element={<ChiSiamoPage />} />
                <Route path="/en/contact" element={<ContattiPage />} />
                <Route path="/en/quote" element={<QuoteCalculatorPage />} />
                <Route path="/en/insights" element={<InsightsHubPage />} />
                <Route path="/en/insights/:slug" element={<InsightDetailPage />} />

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
  );
}

export default App;
