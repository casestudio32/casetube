"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CW = 854; // canvas display width
const CH = 480; // canvas display height (16:9)

const TEMPLATES = [
  { id: "bold", name: "Bold Impact", preview: ["#0f0f0f", "#e50914"] },
  { id: "face", name: "Face + Text", preview: ["#1a1a2e", "#4f46e5"] },
  { id: "neon", name: "Neon Dark", preview: ["#080818", "#00ff88"] },
  { id: "split", name: "Split Screen", preview: ["#e50914", "#0f0f0f"] },
  { id: "cinematic", name: "Cinematic", preview: ["#1c1c1c", "#f59e0b"] },
  { id: "clean", name: "Clean Pro", preview: ["#ffffff", "#1f2937"] },
];

function buildBold(canvas: any, F: any) {
  canvas.backgroundColor = "#0f0f0f";
  const bar = new F.Rect({ left: 0, top: CH - 90, width: CW, height: 90, fill: "#e50914", selectable: false, evented: false, name: "bg-bar" });
  const title = new F.IText("YOUR TITLE HERE", { left: CW / 2, top: CH / 2 - 50, originX: "center", originY: "center", fontSize: 70, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", textAlign: "center", shadow: "3px 3px 10px rgba(0,0,0,0.9)", name: "main-title" });
  const sub = new F.IText("Channel Name  •  Episode 1", { left: CW / 2, top: CH - 52, originX: "center", originY: "center", fontSize: 28, fill: "#ffffff", fontFamily: "Arial, sans-serif", textAlign: "center", name: "subtitle" });
  canvas.add(bar, title, sub);
}

function buildFace(canvas: any, F: any) {
  canvas.backgroundColor = "#1a1a2e";
  const leftBg = new F.Rect({ left: 0, top: 0, width: CW * 0.5, height: CH, fill: "#16213e", selectable: false, evented: false });
  const placeholder = new F.Rect({ left: CW * 0.5 - 100, top: CH / 2 - 120, width: 200, height: 240, fill: "#2d3561", rx: 8, ry: 8, selectable: false, evented: false });
  const placeholderText = new F.Text("📸 Upload\nYour Photo", { left: CW * 0.5 - 100, top: CH / 2 - 50, width: 200, fontSize: 20, fill: "#6b7db3", textAlign: "center", selectable: false, evented: false });
  const accent = new F.Rect({ left: CW * 0.5 + 20, top: 40, width: 6, height: CH - 80, fill: "#e50914", selectable: false, evented: false });
  const title = new F.IText("THIS IS\nYOUR\nTITLE", { left: CW * 0.75, top: CH / 2, originX: "center", originY: "center", fontSize: 56, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", textAlign: "left", lineHeight: 1.1, shadow: "2px 2px 8px rgba(0,0,0,0.8)", name: "main-title" });
  const tag = new F.IText("NEW VIDEO", { left: CW * 0.75, top: 60, originX: "center", originY: "center", fontSize: 22, fill: "#e50914", fontFamily: "Arial, sans-serif", fontWeight: "bold", charSpacing: 200, name: "tag" });
  canvas.add(leftBg, placeholder, placeholderText, accent, tag, title);
}

function buildNeon(canvas: any, F: any) {
  canvas.backgroundColor = "#080818";
  const glow1 = new F.Circle({ left: 100, top: 80, radius: 180, fill: "rgba(99,102,241,0.12)", selectable: false, evented: false });
  const glow2 = new F.Circle({ left: CW - 180, top: CH - 200, radius: 200, fill: "rgba(0,255,136,0.08)", selectable: false, evented: false });
  const line = new F.Rect({ left: 60, top: CH / 2 - 4, width: 60, height: 4, fill: "#00ff88", selectable: false, evented: false });
  const title = new F.IText("YOUR TITLE\nGOES HERE", { left: CW / 2, top: CH / 2 - 20, originX: "center", originY: "center", fontSize: 80, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", textAlign: "center", lineHeight: 1.0, name: "main-title" });
  const highlight = new F.IText("TOPIC", { left: CW / 2, top: CH - 80, originX: "center", originY: "center", fontSize: 36, fill: "#00ff88", fontFamily: "Arial, sans-serif", fontWeight: "bold", charSpacing: 300, shadow: "0px 0px 20px rgba(0,255,136,0.8)", name: "highlight" });
  canvas.add(glow1, glow2, line, title, highlight);
}

function buildSplit(canvas: any, F: any) {
  canvas.backgroundColor = "#0f0f0f";
  const left = new F.Rect({ left: 0, top: 0, width: CW / 2, height: CH, fill: "#e50914", selectable: false, evented: false });
  const diag = new F.Polygon([{ x: CW / 2 - 40, y: 0 }, { x: CW / 2 + 40, y: 0 }, { x: CW / 2 + 40, y: CH }, { x: CW / 2 - 40, y: CH }], { fill: "#cc0000", selectable: false, evented: false });
  const before = new F.IText("BEFORE", { left: CW / 4, top: CH / 2 - 20, originX: "center", originY: "center", fontSize: 64, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", textAlign: "center", shadow: "2px 2px 8px rgba(0,0,0,0.5)", name: "before-text" });
  const after = new F.IText("AFTER", { left: CW * 3 / 4, top: CH / 2 - 20, originX: "center", originY: "center", fontSize: 64, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", textAlign: "center", shadow: "2px 2px 8px rgba(0,0,0,0.5)", name: "after-text" });
  const vs = new F.IText("VS", { left: CW / 2, top: CH / 2, originX: "center", originY: "center", fontSize: 52, fontWeight: "bold", fill: "#ffffff", fontFamily: "Impact, Arial Black, sans-serif", shadow: "0px 0px 12px rgba(0,0,0,0.9)", name: "vs" });
  canvas.add(left, diag, before, after, vs);
}

function buildCinematic(canvas: any, F: any) {
  canvas.backgroundColor = "#1c1c1c";
  const overlay = new F.Rect({ left: 0, top: CH - 160, width: CW, height: 160, fill: "rgba(0,0,0,0.75)", selectable: false, evented: false });
  const bar = new F.Rect({ left: 0, top: CH - 164, width: CW, height: 4, fill: "#f59e0b", selectable: false, evented: false });
  const ep = new F.IText("EPISODE 01", { left: 60, top: CH - 148, fontSize: 18, fill: "#f59e0b", fontFamily: "Arial, sans-serif", fontWeight: "bold", charSpacing: 300, name: "episode" });
  const title = new F.IText("Your Cinematic\nVideo Title Here", { left: 60, top: CH - 118, fontSize: 44, fontWeight: "bold", fill: "#ffffff", fontFamily: "Georgia, serif", lineHeight: 1.1, shadow: "1px 1px 6px rgba(0,0,0,0.9)", name: "main-title" });
  const topText = new F.IText("A CASETUBE ORIGINAL", { left: CW / 2, top: 40, originX: "center", fontSize: 18, fill: "rgba(255,255,255,0.5)", fontFamily: "Arial, sans-serif", charSpacing: 400, name: "top-tag" });
  canvas.add(overlay, bar, ep, title, topText);
}

function buildClean(canvas: any, F: any) {
  canvas.backgroundColor = "#f8fafc";
  const accent = new F.Rect({ left: 0, top: 0, width: 12, height: CH, fill: "#e50914", selectable: false, evented: false });
  const badge = new F.Rect({ left: 40, top: 40, width: 140, height: 40, fill: "#e50914", rx: 4, ry: 4, selectable: false, evented: false });
  const badgeText = new F.Text("TUTORIAL", { left: 110, top: 60, originX: "center", originY: "center", fontSize: 18, fill: "#ffffff", fontWeight: "bold", fontFamily: "Arial, sans-serif", charSpacing: 200, selectable: false, evented: false });
  const title = new F.IText("How to Do\nAmazing Things\nWith AI", { left: CW / 2, top: CH / 2 - 20, originX: "center", originY: "center", fontSize: 64, fontWeight: "bold", fill: "#0f172a", fontFamily: "Arial Black, Impact, sans-serif", textAlign: "center", lineHeight: 1.05, name: "main-title" });
  const line = new F.Rect({ left: CW / 2 - 60, top: CH - 80, width: 120, height: 4, fill: "#e50914", originX: "center", selectable: false, evented: false });
  const channel = new F.IText("@YourChannel", { left: CW / 2, top: CH - 58, originX: "center", fontSize: 22, fill: "#64748b", fontFamily: "Arial, sans-serif", name: "channel" });
  canvas.add(accent, badge, badgeText, line, title, channel);
}

const BUILDERS: Record<string, (c: any, F: any) => void> = {
  bold: buildBold, face: buildFace, neon: buildNeon,
  split: buildSplit, cinematic: buildCinematic, clean: buildClean,
};

export function ThumbnailClient() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fc = useRef<any>(null);
  const Fab = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("bold");
  const [selected, setSelected] = useState<any>(null);
  const [textVal, setTextVal] = useState("");
  const [fontSize, setFontSize] = useState(60);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [shadow, setShadow] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    import("fabric").then((mod: any) => {
      const F = mod.fabric ?? mod;
      Fab.current = F;
      const canvas = new F.Canvas(canvasEl.current, { width: CW, height: CH, selection: true });
      fc.current = canvas;

      canvas.on("selection:created", (e: any) => onSelect(e.selected?.[0]));
      canvas.on("selection:updated", (e: any) => onSelect(e.selected?.[0]));
      canvas.on("selection:cleared", () => setSelected(null));
      canvas.on("object:modified", (e: any) => onSelect(e.target));

      buildBold(canvas, F);
      canvas.renderAll();
      setReady(true);
    });
    return () => fc.current?.dispose();
  }, []);

  const onSelect = (obj: any) => {
    if (!obj) return;
    setSelected(obj);
    if (obj.type === "i-text" || obj.type === "text") {
      setTextVal(obj.text ?? "");
      setFontSize(Math.round(obj.fontSize ?? 60));
      setTextColor(obj.fill ?? "#ffffff");
      setBold(obj.fontWeight === "bold");
      setItalic(obj.fontStyle === "italic");
      setShadow(!!obj.shadow);
    }
  };

  const applyText = useCallback((val: string) => {
    setTextVal(val);
    if (selected?.type === "i-text" || selected?.type === "text") {
      selected.set("text", val);
      fc.current?.renderAll();
    }
  }, [selected]);

  const applyFontSize = useCallback((val: number) => {
    setFontSize(val);
    if (selected) { selected.set("fontSize", val); fc.current?.renderAll(); }
  }, [selected]);

  const applyColor = useCallback((val: string) => {
    setTextColor(val);
    if (selected) { selected.set("fill", val); fc.current?.renderAll(); }
  }, [selected]);

  const applyBold = useCallback((val: boolean) => {
    setBold(val);
    if (selected) { selected.set("fontWeight", val ? "bold" : "normal"); fc.current?.renderAll(); }
  }, [selected]);

  const applyItalic = useCallback((val: boolean) => {
    setItalic(val);
    if (selected) { selected.set("fontStyle", val ? "italic" : "normal"); fc.current?.renderAll(); }
  }, [selected]);

  const applyShadow = useCallback((val: boolean) => {
    setShadow(val);
    if (selected && Fab.current) {
      selected.set("shadow", val ? new Fab.current.Shadow({ color: "rgba(0,0,0,0.8)", blur: 12, offsetX: 2, offsetY: 2 }) : null);
      fc.current?.renderAll();
    }
  }, [selected]);

  const switchTemplate = (id: string) => {
    if (!fc.current || !Fab.current) return;
    fc.current.clear();
    BUILDERS[id]?.(fc.current, Fab.current);
    fc.current.renderAll();
    setActiveTemplate(id);
    setSelected(null);
  };

  const addText = () => {
    if (!fc.current || !Fab.current) return;
    const t = new Fab.current.IText("New Text", {
      left: CW / 2, top: CH / 2, originX: "center", originY: "center",
      fontSize: 48, fill: "#ffffff", fontWeight: "bold",
      fontFamily: "Impact, Arial Black, sans-serif",
      shadow: "2px 2px 8px rgba(0,0,0,0.8)",
    });
    fc.current.add(t);
    fc.current.setActiveObject(t);
    fc.current.renderAll();
  };

  const uploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file || !Fab.current) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        Fab.current.Image.fromURL(ev.target?.result as string, (img: any) => {
          img.scaleToHeight(CH * 0.8);
          img.set({ left: CW / 2, top: CH / 2, originX: "center", originY: "center" });
          fc.current.add(img);
          fc.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const deleteSelected = () => {
    const obj = fc.current?.getActiveObject();
    if (obj) { fc.current.remove(obj); fc.current.renderAll(); setSelected(null); }
  };

  const exportPNG = () => {
    setExporting(true);
    setTimeout(() => {
      const dataUrl = fc.current.toDataURL({ format: "png", multiplier: 1280 / CW, quality: 1 });
      const a = document.createElement("a");
      a.download = "thumbnail-1280x720.png";
      a.href = dataUrl;
      a.click();
      setExporting(false);
    }, 100);
  };

  const isText = selected?.type === "i-text" || selected?.type === "text";

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white font-bold text-lg">Thumbnail Maker</h1>
          <p className="text-zinc-500 text-xs">1280 × 720 px • Click any element to edit</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addText} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Text
          </button>
          <button onClick={uploadImage} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Upload Image
          </button>
          {selected && (
            <button onClick={deleteSelected} className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 text-sm rounded-lg transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Delete
            </button>
          )}
          <button
            onClick={exportPNG}
            disabled={!ready || exporting}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {exporting ? "Exporting..." : "Export PNG"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Templates panel */}
        <div className="w-48 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0 overflow-y-auto">
          <p className="text-zinc-500 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Templates</p>
          <div className="px-3 pb-4 space-y-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTemplate(t.id)}
                className={`w-full rounded-lg overflow-hidden transition-all ${activeTemplate === t.id ? "ring-2 ring-red-500 ring-offset-1 ring-offset-zinc-900" : "hover:ring-1 hover:ring-zinc-600"}`}
              >
                <div
                  className="h-20 w-full flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${t.preview[0]} 50%, ${t.preview[1]} 100%)` }}
                >
                  <span className="text-white text-xs font-bold text-center px-2 drop-shadow">{t.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center bg-zinc-950 overflow-auto p-6">
          <div className="relative shadow-2xl">
            <canvas ref={canvasEl} />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded">
                <div className="text-zinc-400 text-sm">Loading editor...</div>
              </div>
            )}
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-60 bg-zinc-900 border-l border-zinc-800 flex flex-col flex-shrink-0 overflow-y-auto">
          <p className="text-zinc-500 text-xs font-semibold px-4 py-3 uppercase tracking-wider">Properties</p>

          {!selected && (
            <div className="px-4 py-8 text-center">
              <div className="text-zinc-600 text-sm">Click any element on the canvas to edit it</div>
            </div>
          )}

          {selected && isText && (
            <div className="px-4 space-y-5 pb-6">
              {/* Text content */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-2">Text</label>
                <textarea
                  value={textVal}
                  onChange={(e) => applyText(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Font size */}
              <div>
                <label className="text-zinc-400 text-xs font-medium flex justify-between mb-2">
                  Font Size <span className="text-white">{fontSize}px</span>
                </label>
                <input
                  type="range" min={12} max={150} value={fontSize}
                  onChange={(e) => applyFontSize(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-2">Text Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={textColor} onChange={(e) => applyColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                  <input value={textColor} onChange={(e) => applyColor(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500" />
                </div>
              </div>

              {/* Style toggles */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-2">Style</label>
                <div className="flex gap-2">
                  <button onClick={() => applyBold(!bold)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bold ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>B</button>
                  <button onClick={() => applyItalic(!italic)} className={`flex-1 py-2 rounded-lg text-sm italic transition-all ${italic ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>I</button>
                  <button onClick={() => applyShadow(!shadow)} className={`flex-1 py-2 rounded-lg text-xs transition-all ${shadow ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`} style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>S</button>
                </div>
              </div>

              {/* Quick colors */}
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-2">Quick Colors</label>
                <div className="flex flex-wrap gap-2">
                  {["#ffffff", "#000000", "#e50914", "#f59e0b", "#00ff88", "#4f46e5", "#ec4899", "#06b6d4"].map((c) => (
                    <button key={c} onClick={() => applyColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${textColor === c ? "border-white scale-110" : "border-transparent hover:border-zinc-500"}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {selected && !isText && (
            <div className="px-4 py-4 space-y-4">
              <div className="text-zinc-400 text-xs">Image selected. Drag to reposition, use handles to resize.</div>
              <div>
                <label className="text-zinc-400 text-xs font-medium flex justify-between mb-2">
                  Opacity <span className="text-white">{Math.round((selected.opacity ?? 1) * 100)}%</span>
                </label>
                <input
                  type="range" min={0} max={100} value={Math.round((selected.opacity ?? 1) * 100)}
                  onChange={(e) => { selected.set("opacity", Number(e.target.value) / 100); fc.current?.renderAll(); }}
                  className="w-full accent-red-500"
                />
              </div>
              <button onClick={() => { selected.sendToBack(); fc.current?.renderAll(); }} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-all">Send to Back</button>
              <button onClick={() => { selected.bringToFront(); fc.current?.renderAll(); }} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-all">Bring to Front</button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-auto px-4 py-4 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs leading-relaxed">
              💡 Double-click text to edit inline on the canvas. Drag corners to resize.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
