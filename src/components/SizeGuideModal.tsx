"use client";

import React, { useState } from "react";
import { useCustomizer } from "@/context/CustomizerContext";
import { X, Ruler, Check } from "lucide-react";
import { sound } from "@/utils/audio";

const SIZE_CHART = [
  { usMen: "6.0", usWomen: "7.5", uk: "5.5", eu: "38.5", cm: "24.0" },
  { usMen: "6.5", usWomen: "8.0", uk: "6.0", eu: "39.0", cm: "24.5" },
  { usMen: "7.0", usWomen: "8.5", uk: "6.0", eu: "40.0", cm: "25.0" },
  { usMen: "7.5", usWomen: "9.0", uk: "6.5", eu: "40.5", cm: "25.5" },
  { usMen: "8.0", usWomen: "9.5", uk: "7.0", eu: "41.0", cm: "26.0" },
  { usMen: "8.5", usWomen: "10.0", uk: "7.5", eu: "42.0", cm: "26.5" },
  { usMen: "9.0", usWomen: "10.5", uk: "8.0", eu: "42.5", cm: "27.0" },
  { usMen: "9.5", usWomen: "11.0", uk: "8.5", eu: "43.0", cm: "27.5" },
  { usMen: "10.0", usWomen: "11.5", uk: "9.0", eu: "44.0", cm: "28.0" },
  { usMen: "10.5", usWomen: "12.0", uk: "9.5", eu: "44.5", cm: "28.5" },
  { usMen: "11.0", usWomen: "12.5", uk: "10.0", eu: "45.0", cm: "29.0" },
  { usMen: "11.5", usWomen: "13.0", uk: "10.5", eu: "45.5", cm: "29.5" },
  { usMen: "12.0", usWomen: "13.5", uk: "11.0", eu: "46.0", cm: "30.0" },
  { usMen: "13.0", usWomen: "14.5", uk: "12.0", eu: "47.5", cm: "31.0" },
];

export default function SizeGuideModal() {
  const { sizeGuideOpen, setSizeGuideOpen, selectedSize, setSelectedSize } = useCustomizer();
  const [filterGender, setFilterGender] = useState<"men" | "women">("men");

  if (!sizeGuideOpen) return null;

  const handleSelect = (usSize: string) => {
    sound.playSelect();
    setSelectedSize(`US ${usSize}`);
    setSizeGuideOpen(false);
  };

  return (
    <div className="size-guide-overlay" onClick={() => setSizeGuideOpen(false)}>
      <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Ruler size={18} color="#39ff14" />
            <h3>Precision Footwear Sizing Matrix</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              sound.playClick(500, 0.02);
              setSizeGuideOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="gender-tab-row">
          <button
            className={`gender-tab ${filterGender === "men" ? "active" : ""}`}
            onClick={() => setFilterGender("men")}
          >
            US Men&apos;s Standard
          </button>
          <button
            className={`gender-tab ${filterGender === "women" ? "active" : ""}`}
            onClick={() => setFilterGender("women")}
          >
            US Women&apos;s Standard
          </button>
        </div>

        <div className="size-table-container">
          <table className="size-table">
            <thead>
              <tr>
                <th>{filterGender === "men" ? "US Men" : "US Women"}</th>
                <th>UK</th>
                <th>EU</th>
                <th>Foot Length (CM)</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row, idx) => {
                const targetVal = filterGender === "men" ? row.usMen : row.usWomen;
                const isCurrent = selectedSize === `US ${targetVal}`;

                return (
                  <tr key={idx} className={isCurrent ? "selected-row" : ""}>
                    <td className="font-bold">US {targetVal}</td>
                    <td>{row.uk}</td>
                    <td>{row.eu}</td>
                    <td>{row.cm} cm</td>
                    <td>
                      <button
                        className={`size-pick-btn ${isCurrent ? "current" : ""}`}
                        onClick={() => handleSelect(targetVal)}
                      >
                        {isCurrent ? <Check size={13} /> : "Choose"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="size-tips-box">
          <span className="tip-title">Fit Recommendation:</span>
          <p>
            NextStep footwear runs true to size with an adaptive sock liner. For wide feet or thick technical socks, we recommend selecting a half-size up.
          </p>
        </div>
      </div>
    </div>
  );
}
