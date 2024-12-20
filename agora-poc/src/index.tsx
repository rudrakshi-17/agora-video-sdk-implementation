import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import App from "./App";

// Define root element and ensure it's not null
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Define Agora RTC client with proper type
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

root.render(
  <StrictMode>
    <AgoraRTCProvider client={client}>
      <App />
    </AgoraRTCProvider>
  </StrictMode>
);
