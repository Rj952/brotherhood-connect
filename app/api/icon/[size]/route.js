import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request, { params }) {
  const size = parseInt(params.size) || 512;
  const s = Math.min(Math.max(size, 48), 1024);

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          borderRadius: s * 0.15,
        }}
      >
        <svg
          width={s * 0.5}
          height={s * 0.5}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="35" r="18" fill="#d4af37" />
          <path
            d="M50 58c-22 0-38 14-38 28v6c0 4 3 8 7 8h62c4 0 7-4 7-8v-6c0-14-16-28-38-28z"
            fill="#d4af37"
          />
        </svg>
        <div
          style={{
            color: "#d4af37",
            fontSize: s * 0.12,
            fontWeight: "bold",
            marginTop: s * 0.02,
            fontFamily: "sans-serif",
          }}
        >
          BC
        </div>
      </div>
    ),
    { width: s, height: s }
  );
}
