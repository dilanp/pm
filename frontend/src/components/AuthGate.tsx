"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoginScreen } from "@/components/LoginScreen";

const STORAGE_KEY = "pm-authenticated";

type AuthGateProps = {
  children: (actions: { onLogout: () => void }) => ReactNode;
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(stored === "true");
    setIsReady(true);
  }, []);

  const handleLogin = (username: string, password: string) => {
    const isValid = username === "user" && password === "password";

    if (isValid) {
      window.localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
    }

    return isValid;
  };

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  };

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <>{children({ onLogout: handleLogout })}</>;
};
