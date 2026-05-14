import React, { useState, useRef } from 'react';
import { FiUpload, FiLoader } from 'react-icons/fi';
import { uploadImage } from '../../utils/uploadImage';

/**
 * Botón flotante para agregar foto a la galería comunitaria del lugar
 * Usado por usuarios que NO crearon el lugar
 */
export default function AddPhotoToPlaceButton({
  placeId,
  usuarioId,
  onPhotoAdded = null,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Detectar URL del backend según el ambiente
  const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;
    
    // Si estamos en producción (dominio diferente a localhost), usar Render
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      return 'https://spotapp-2026.onrender.com';
    }
    
    // En desarrollo local, usar localhost
    return 'http://localhost:3000';
  };
  
  const apiUrl = getBackendUrl();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🔵 Subiendo foto a:', apiUrl);
    setIsUploading(true);

    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        setIsUploading(false);
        e.target.value = '';
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert('La imagen es muy grande. Máximo 10 MB.');
        setIsUploading(false);
        e.target.value = '';
        return;
      }

      // Subir a Storage
      const path = `place-gallery/${placeId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const imageUrl = await uploadImage(file, 'spotapp', path, {
        maxWidth: 1080,
        quality: 0.8,
      });

      // Enviar al backend
      const response = await fetch(`${apiUrl}/places/${placeId}/fotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagenUrl: imageUrl,
          usuarioId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar foto al servidor');
      }

      const data = await response.json();
      
      // Callback para refrescar datos del lugar
      if (onPhotoAdded) {
        onPhotoAdded();
      }

      // Mensaje de éxito
      alert('¡Foto agregada exitosamente!');
    } catch (error) {
      console.error('Error completo:', error);
      console.error('URL usado:', apiUrl);
      
      let mensajeError = error.message;
      
      // Detectar errores específicos
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        mensajeError = `No se pudo conectar al servidor. Verifica tu conexión a internet.`;
      } else if (error.message.includes('agregar foto al servidor')) {
        mensajeError = `Error del servidor: ${error.message}`;
      }
      
      alert(`❌ ${mensajeError}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm font-medium transition-colors"
        title="Agregar tu foto al lugar"
      >
        {isUploading ? (
          <>
            <FiLoader className="w-4 h-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <FiUpload className="w-4 h-4" />
            Agregar mi foto
          </>
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
