import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import * as nsfwjs from "nsfwjs";
import { useUser } from "../../userProvider";
import { uploadImage } from "../../utils/uploadImage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Extracts the cropped image as a blob from the canvas
async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((res, rej) => { image.onload = res; image.onerror = rej; });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
}

function AvatarPreview({ preview }) {
  return (
    <div className="flex justify-center">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
        {preview ? (
          <img src={preview} alt="foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-9 h-9 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
      </div>
    </div>
  );
}

// Full-screen crop modal (matches the screenshot style)
function CropModal({ imageSrc, onApply, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
    onApply(blob);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Title */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h3 className="text-sm font-semibold text-white">Ajustar foto de perfil</h3>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cropper area — fixed height */}
        <div className="relative w-full" style={{ height: 280 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            style={{ containerStyle: { background: "#000" } }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-4 py-3 flex items-center gap-2.5">
          <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-white cursor-pointer h-1" />
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>
            </svg>
          </button>
          <span className="text-white/40 text-[11px] w-9 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={handleApply} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWizard({ onComplete }) {
  const { user, setUser } = useUser();
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";
  const isGoogle = !!(user?.googleId || user?.provider === "google" || authToken.startsWith("google-token-"));
  const totalSteps = isGoogle ? 3 : 2;

  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.fotoPerfil && user.fotoPerfil !== "https://via.placeholder.com/150" ? user.fotoPerfil : null
  );
  const [imageCheckState, setImageCheckState] = useState("idle"); // idle|checking|blocked|ok
  const [imageBlockReason, setImageBlockReason] = useState("");
  const [nameError, setNameError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Crop flow
  const [rawImageSrc, setRawImageSrc] = useState(null); // original before crop
  const [showCrop, setShowCrop] = useState(false);
  const nsfwModelRef = useRef(null);

  const stepLabels = isGoogle
    ? ["Tu nombre", "Foto de perfil", "Términos"]
    : ["Foto de perfil", "Términos"];

  const photoStepIndex = isGoogle ? 2 : 1;
  const termsStepIndex = isGoogle ? 3 : 2;

  const handleFileSelected = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    const url = URL.createObjectURL(f);
    setRawImageSrc(url);
    setShowCrop(true);
  };

  const handleCropApply = async (blob) => {
    setShowCrop(false);
    const croppedUrl = URL.createObjectURL(blob);
    setPhotoPreview(croppedUrl);
    setPhotoBlob(null);
    setImageCheckState("checking");
    setImageBlockReason("");

    try {
      if (!nsfwModelRef.current) nsfwModelRef.current = await nsfwjs.load();
      const img = new Image();
      img.src = croppedUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const predictions = await nsfwModelRef.current.classify(img);
      // Umbrales altos — solo bloquea contenido explícito real, no retratos normales
      const rules = { Porn: 0.70, Hentai: 0.70, Sexy: 0.90 };
      const blocked = predictions.find((p) => rules[p.className] != null && p.probability >= rules[p.className]);
      if (blocked) {
        setImageBlockReason("Contenido inapropiado detectado. Sube otra foto.");
        setImageCheckState("blocked");
        setPhotoPreview(null);
        setPhotoBlob(null);
        return;
      }
      setImageCheckState("ok");
      setPhotoBlob(blob);
    } catch {
      // Si el modelo no carga (red), fail-open: se acepta la imagen
      setImageCheckState("ok");
      setPhotoBlob(blob);
    }
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    setRawImageSrc(null);
  };

  const handleNext = () => {
    if (isGoogle && step === 1) {
      if (!nombre.trim()) { setNameError("El nombre es obligatorio"); return; }
      setNameError("");
    }
    setStep((s) => s + 1);
  };

  const handleComplete = async () => {
    if (!termsAccepted) return;
    setSubmitting(true);
    setUploadError("");
    try {
      const body = {};

      if (isGoogle && nombre.trim()) {
        body.nombre = `${nombre.trim()}${apellido.trim() ? " " + apellido.trim() : ""}`;
      }

      if (photoBlob) {
        const file = new File([photoBlob], "perfil.jpg", { type: "image/jpeg" });
        const path = `perfiles/${user.id}_${Date.now()}.jpg`;
        const url = await uploadImage(file, "spotapp", path, { maxWidth: 500, quality: 0.85 });
        body.fotoPerfil = url;
      }

      if (Object.keys(body).length > 0) {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setUser((prev) => ({ ...prev, ...body }));
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error ${res.status}`);
        }
      }

      // Only mark done and dismiss on success
      if (user?.id) localStorage.setItem(`spotapp_onboarding_done_${user.id}`, "1");
      onComplete?.();
    } catch (e) {
      console.error("[Onboarding]", e);
      setUploadError("No se pudo guardar tu perfil. Intenta de nuevo o salta este paso.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (user?.id) localStorage.setItem(`spotapp_onboarding_done_${user.id}`, "1");
    onComplete?.();
  };

  return (
    <>
      {/* Crop modal — renders on top of everything */}
      {showCrop && rawImageSrc && (
        <CropModal imageSrc={rawImageSrc} onApply={handleCropApply} onCancel={handleCropCancel} />
      )}

      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {step === photoStepIndex ? "Tu foto de perfil" : step === termsStepIndex ? "Términos y condiciones" : "¡Bienvenido a SpotApp!"}
              </h2>
            </div>

            {/* Step bar */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? "flex-1 bg-[var(--text-primary)]" : i + 1 < step ? "w-6 bg-[var(--text-tertiary)]" : "flex-1 bg-[var(--bg-tertiary)]"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              Paso {step} de {totalSteps} — {stepLabels[step - 1]}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5 flex-1 overflow-y-auto">

            {/* Step 1 (Google only): Nombre + Apellido */}
            {isGoogle && step === 1 && (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  Muchas veces los correos de Google tienen apodos. Elige cómo quieres que te vean en SpotApp.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                      Nombre <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={nombre}
                      onChange={(e) => { setNombre(e.target.value); if (e.target.value.trim()) setNameError(""); }}
                      placeholder="Ej. Juan"
                      className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors ${nameError ? "border-red-400 focus:border-red-400" : "border-[var(--border-color)] focus:border-[var(--text-tertiary)]"}`}
                    />
                    {nameError && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                      Apellido
                    </label>
                    <input
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. García"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--text-tertiary)] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Photo step */}
            {step === photoStepIndex && (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  Elige una foto para tu perfil. Puedes agregarla después si lo prefieres.
                </p>

                <AvatarPreview preview={photoPreview} />

                <div className="flex items-center gap-3">
                  <label htmlFor="onboarding-photo" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm cursor-pointer hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Subir foto
                  </label>
                  <input id="onboarding-photo" type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
                  {imageCheckState === "checking" && (
                    <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={0.25}/><path d="M21 12a9 9 0 00-9-9"/></svg>
                      Verificando...
                    </div>
                  )}
                  {imageCheckState === "ok" && (
                    <span className="text-[12px] text-green-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Lista
                    </span>
                  )}
                </div>
                {imageCheckState === "blocked" && (
                  <p className="text-[12px] text-red-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {imageBlockReason}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline underline-offset-2 self-start transition-colors"
                >
                  Continuar sin foto
                </button>
              </>
            )}

            {/* Terms step */}
            {step === termsStepIndex && (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  Para usar SpotApp debes aceptar nuestros términos y condiciones.
                </p>
                <div className="h-48 overflow-y-auto rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  <p className="font-semibold text-[var(--text-primary)] mb-2">Términos y Condiciones de SpotApp</p>
                  <p className="mb-2">Al usar SpotApp aceptas que:</p>
                  <ul className="list-disc list-inside flex flex-col gap-1.5">
                    <li>Solo publicarás contenido del que tienes derechos o permiso.</li>
                    <li>No publicarás contenido ofensivo, ilegal o que viole la privacidad de terceros.</li>
                    <li>No compartirás información personal de otras personas sin su consentimiento.</li>
                    <li>Respetarás a los demás usuarios y sus publicaciones.</li>
                    <li>SpotApp puede remover contenido que viole estas normas sin previo aviso.</li>
                    <li>Tus datos de ubicación se usan únicamente para mostrar lugares cercanos y personas en tu zona. No se comparten con terceros.</li>
                    <li>Puedes eliminar tu cuenta y datos en cualquier momento desde Configuración.</li>
                  </ul>
                  <p className="mt-3">Estos términos pueden actualizarse. Te notificaremos ante cambios importantes.</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" className="sr-only" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${termsAccepted ? "bg-[var(--text-primary)] border-[var(--text-primary)]" : "border-[var(--border-color)] bg-[var(--bg-secondary)]"}`}>
                      {termsAccepted && (
                        <svg className="w-3 h-3 text-[var(--bg-primary)]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    He leído y acepto los términos y condiciones de SpotApp.
                  </span>
                </label>
              </>
            )}
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="px-6 pb-2">
              <p className="text-[12px] text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {uploadError}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-between items-center">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors">
                Atrás
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={step === photoStepIndex && imageCheckState === "checking"}
                className="px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!termsAccepted || submitting}
                className="px-5 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={0.25}/><path d="M21 12a9 9 0 00-9-9"/></svg>
                )}
                Comenzar
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
