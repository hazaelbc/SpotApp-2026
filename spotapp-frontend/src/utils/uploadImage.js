import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Redimensiona y comprime un File usando Canvas, luego lo sube a Supabase Storage.
 *
 * @param {File} file        - Archivo de imagen del <input type="file">
 * @param {string} bucket    - Nombre del bucket en Supabase Storage
 * @param {string} path      - Ruta dentro del bucket, ej: "places/foto.jpg"
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1080]  - Ancho máximo en px
 * @param {number} [opts.quality=0.8]   - Calidad JPEG/WEBP (0-1)
 * @returns {Promise<string>} URL pública del archivo subido
 */
export async function uploadImage(file, bucket, path, opts = {}) {
  const { maxWidth = 1080, quality = 0.8 } = opts;

  const compressed = await compressImage(file, maxWidth, quality);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, {
      contentType: compressed.type,
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Redimensiona y comprime un File usando el API Canvas del navegador.
 * Devuelve un nuevo File con el mismo nombre pero contenido optimizado.
 */
function compressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    let loadTimeout;

    img.onload = () => {
      clearTimeout(loadTimeout);
      URL.revokeObjectURL(objectUrl);

      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          resolve(new File([blob], file.name, { type: outputType }));
        },
        outputType,
        outputType === 'image/png' ? undefined : quality,
      );
    };

    img.onerror = () => {
      clearTimeout(loadTimeout);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen. Verifica que sea un archivo de imagen válido.'));
    };

    // Timeout de 10 segundos para cargar la imagen
    loadTimeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Tiempo agotado al cargar la imagen'));
    }, 10000);

    img.src = objectUrl;
  });
}
