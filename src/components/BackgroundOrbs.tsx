"use client"

import React from "react"

export default function BackgroundOrbs() {
  return (
    <div className="bg-gradient" aria-hidden="true">
      {/* Orb Oro */}
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          top: -120,
          left: -160,
          background:
            "radial-gradient(closest-side, rgba(212,175,55,0.3), rgba(212,175,55,0))",
        }}
      />

      {/* Orb Blu */}
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          bottom: -140,
          right: -100,
          background:
            "radial-gradient(closest-side, rgba(0,102,255,0.2), rgba(0,102,255,0))",
        }}
      />

      {/* Orb Verde */}
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          top: "40%",
          left: "60%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(closest-side, rgba(0,255,136,0.15), rgba(0,255,136,0))",
        }}
      />
    </div>
  )
}