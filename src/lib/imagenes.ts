import sharp from "sharp";

// Comprime cualquier foto que suba el admin antes de guardarla en el
// storage. Las fotos de celular llegan de varios MB (a veces 3-4MB) sin
// comprimir — eso es lo que hacía lenta la carga tanto del catálogo público
// como de las tablas del admin (Next.js tiene que reducir esa foto entera
// cada vez que hace falta una miniatura). Se re-codifica siempre como JPEG
// (estas fotos son todas fotográficas, ninguna necesita transparencia) y se
// limita el lado más largo a 1600px — de sobra para cómo se muestran en el
// sitio, incluso en pantallas de alta densidad.
export async function comprimirImagen(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // respeta la orientación EXIF de fotos tomadas con celular
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
