import { ImageResponse } from "next/og";

export const alt = "Clarix - AI Project Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#6366f1",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 40 }}>
          Clarix
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#a1a1aa", marginTop: 16 }}>
          AI-powered project management for modern teams
        </div>
      </div>
    ),
    { ...size }
  );
}