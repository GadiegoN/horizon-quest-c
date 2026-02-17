"use client";

import * as React from "react";
import { ToastProvider } from "../ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
