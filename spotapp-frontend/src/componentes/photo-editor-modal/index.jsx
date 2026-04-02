import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FiX, FiCheck, FiZoomIn, FiZoomOut } from "react-icons/fi";

/**
 * Recorta la imagen en canvas según el pixelCrop devuelto por react-easy-crop
 * y retorna un File listo para subir.
 */
async function getCroppedFile(imageSrc, pixelCrop, fileName) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
      resolve(new File([blob], fileName, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
}

/**
 * mode: "profile" | "cover"
 * imageSrc: string (object URL del archivo seleccionado)
 * fileName: string
 * onConfirm(file): llamado con el File recortado
 * onCancel(): llamado al cerrar sin confirmar
 */
export default function PhotoEditorModal({ mode, imageSrc, fileName, onConfirm, onCancel }) {
  const isProfile = mode === "profile";

  // Aspect ratio: perfil = 1:1, portada = ~16:5
  const aspect = isProfile ? 1 : 16 / 5;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setPixelCrop(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!pixelCrop) return;
    setConfirming(true);
    try {
      const file = await getCroppedFile(imageSrc, pixelCrop, fileName);
      onConfirm(file);
    } catch (e) {
      console.error("Error cropping image:", e);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: isProfile ? "min(480px, 94vw)" : "min(820px, 96vw)",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-white font-semibold text-sm tracking-wide">
            {isProfile ? "Ajustar foto de perfil" : "Ajustar foto de portada"}
          </span>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Cerrar"
          >
            <FiX className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Crop area */}
        <div
          className="relative w-full"
          style={{ height: isProfile ? "min(420px, 80vw)" : "min(340px, 52vw)" }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            cropShape={isProfile ? "rect" : "rect"}
            style={{
              containerStyle: { background: "#0a0a0a" },
              cropAreaStyle: {
                border: "2px solid rgba(255,255,255,0.85)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Alejar"
          >
            <FiZoomOut className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              accentColor: "white",
              background: `linear-gradient(to right, white ${((zoom - 1) / 2) * 100}%, rgba(255,255,255,0.2) ${((zoom - 1) / 2) * 100}%)`,
            }}
            aria-label="Zoom"
          />

          <button
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Acercar"
          >
            <FiZoomIn className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <span className="text-gray-500 text-xs w-10 text-right tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" strokeWidth={2} />
            )}
            {confirming ? "Aplicando…" : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
