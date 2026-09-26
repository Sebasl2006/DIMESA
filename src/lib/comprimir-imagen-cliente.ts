// Se ejecuta en el NAVEGADOR, antes de mandar el formulario. Una foto de
// celular moderna pesa 3-10 MB; el servidor rechaza todo lo que pase de 5 MB
// (y Next.js corta la petición ANTES de que nuestro código pueda decir "la
// foto pesa demasiado", así que el administrador veía un error en inglés).
// Aquí la foto se reduce a un tamaño más que suficiente para la tienda
// (1600 px por el lado largo, JPEG calidad 85) — de paso las fotos cargan
// más rápido para los clientes.

const LADO_MAXIMO = 1600;
const CALIDAD = 0.85;
// Las fotos que ya son livianas se dejan tal cual (sin volver a comprimirlas).
const PESO_QUE_SE_DEJA_TAL_CUAL = 900 * 1024;

export async function prepararImagenParaSubir(file: File): Promise<File> {
  // Un GIF puede ser animado — al pasarlo por un canvas se perdería.
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));

    if (escala === 1 && file.size <= PESO_QUE_SE_DEJA_TAL_CUAL) {
      bitmap.close();
      return file;
    }

    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    // JPEG no tiene transparencia: un PNG con fondo transparente saldría negro.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, "image/jpeg", CALIDAD));
    // Si por algo quedó más pesada que la original, se deja la original.
    if (!blob || blob.size >= file.size) return file;

    const nombre = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nombre, { type: "image/jpeg" });
  } catch {
    // El navegador no pudo leer la foto (por ejemplo HEIC de iPhone en
    // Chrome): se manda tal cual y el servidor explica el formato permitido.
    return file;
  }
}

// Reemplaza, dentro del FormData, cada foto por su versión ya reducida.
export async function prepararImagenesDelFormulario(formData: FormData): Promise<void> {
  for (const [clave, valor] of Array.from(formData.entries())) {
    if (valor instanceof File && valor.size > 0 && valor.type.startsWith("image/")) {
      formData.set(clave, await prepararImagenParaSubir(valor));
    }
  }
}
