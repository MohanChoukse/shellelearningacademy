
import { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { Toaster } from "./components/ui/sonner";
import VolunteerRegistrationForm from "./components/VolunteerRegistrationForm";
import OrganizationRegistrationForm from "./components/OrganizationRegistrationForm";
import ResetPassword from "./components/ResetPassword";

export default function AppContent() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "login",
  });

  const openModal = (type, userType) =>
    setModalState({ isOpen: true, type, userType });

  const closeModal = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));

  const { pathname } = useLocation();

  return (
    <div className="font-sans leading-relaxed overflow-x-hidden">
      <Toaster position="top-right" richColors />
    
      {pathname !== "/volunteer" && pathname !== "/organization" && <Navigation onOpenModal={openModal} />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero onOpenModal={openModal} />
              <About />
              <HowItWorks />
              <Features />
              <Contact />
              <Footer />
            </>
          }
        />

    
        <Route
          path="/organization"
          element={<OrganizationRegistrationForm />}
        />

        <Route path="/volunteer" element={<VolunteerRegistrationForm />} />

        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      <AuthModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        userType={modalState.userType}
      />
    </div>
  );
}
