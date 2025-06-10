"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

import { Copy, Palette, Minimize, Maximize } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Theme } from "@/types/type";

interface MermaidProps {
  chart: string;
  annotations?: { [key: string]: string }; // Key-value pairs for annotations
  layout?: "vertical" | "horizontal"; // Layout customization
}

const Available_Themes: Theme[] = [
  "default",
  "neutral",
  "dark",
  "forest",
  "base",
];

export function Mermaid({
  chart,
  annotations = {},
  layout = "vertical",
}: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("default");
  const [label, setLabel] = useState("Copy SVG");
  const [isMinimized, setIsMinimized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleCopyClick = () => {
    if (ref.current) {
      const svgCode = ref.current.innerHTML;
      navigator.clipboard.writeText(svgCode);
      setLabel("Copied to clipboard!");

      setTimeout(() => {
        setLabel("Copy SVG");
      }, 2000);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Limit zoom-in to 2x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1)); // Limit zoom-out to 0.1x
  };

  const handleZoom = (deltaY: number) => {
    setZoomLevel((prev) => {
      const newZoom = prev - deltaY * 0.001; // Adjust zoom sensitivity
      return Math.min(Math.max(newZoom, 0.1), 2); // Clamp zoom level between 0.1x and 2x
    });
  };

  async function drawChart(
    chart: string,
    theme: Theme | "",
    annotations: { [key: string]: string },
    layout: "vertical" | "horizontal"
  ) {
    if (ref.current) {
      ref.current.removeAttribute("data-processed");
      mermaid.mermaidAPI.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme,
        logLevel: 5,
        flowchart: {
          useMaxWidth: true,
          diagramPadding: 0, // Remove white space
          nodeSpacing: 70, // Professional spacing between nodes
          rankSpacing: 70, // Professional spacing between ranks
        },
        themeVariables: {
          fontSize: "clamp(14px, 1.5vw, 18px)", // Responsive font size
          nodeBorder: "3px solid #333", // Professional node borders
          primaryColor: "#007BFF", // Professional color scheme
          edgeLabelBackground: "#F8F9FA", // Background for edge labels
        },
      });

      // Add annotations to the chart
      let annotatedChart = chart;
      for (const [key, value] of Object.entries(annotations)) {
        annotatedChart = annotatedChart.replace(
          key,
          `${key}:::annotation`
        );
      }

      const { svg } = await mermaid.mermaidAPI.render("id", annotatedChart);
      ref.current.innerHTML = svg;
    }
  }

  useEffect(() => {
    drawChart(chart, theme, annotations, layout);
  }, [chart, theme, annotations, layout]);

  const handleThemeChange = async (value: Theme) => {
    setTheme(value);
    localStorage.setItem("theme", value);

    // Rerender chart
    drawChart(chart, value, annotations, layout);
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        event.preventDefault();
        handleZoom(event.deltaY);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className="flex gap-4">
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[200px] h-12 border border-gray-300 rounded-md shadow-sm">
              <Palette className="h-6 w-6 mr-2 text-gray-600" />
              <SelectValue id="model" placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              {Available_Themes.map((theme) => {
                return (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
            onClick={handleCopyClick}
          >
            <Copy className="h-6 w-6" />
            {label}
          </button>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700"
            onClick={toggleMinimize}
          >
            {isMinimized ? (
              <Maximize className="h-6 w-6" />
            ) : (
              <Minimize className="h-6 w-6" />
            )}
            {isMinimized ? "Maximize" : "Minimize"}
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-grow overflow-auto flex justify-center items-center">
        <div
          ref={ref}
          className="mermaid"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center",
          }}
        />
      </div>
    </div>
  );
}
