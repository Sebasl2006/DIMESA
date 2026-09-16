// La bio de un profesional se guarda en una sola columna de texto como
// "descripción normal — frase para la viñeta", con un guion largo rodeado
// de espacios como separador. Este archivo centraliza cómo partirla (para
// mostrarla en la página pública) y volverla a unir (al guardar desde el
// admin, que la edita como dos campos separados) — antes esta lógica solo
// vivía en la página pública, así que el admin no tenía forma de escribir
// la frase de la viñeta sin conocer este truco del guion largo a mano.
const SEPARADOR = " — ";

export interface BioPartida {
  texto: string;
  frase: string;
}

export function partirBio(bio: string): BioPartida {
  const bioLimpia = bio.trim();
  const indice = bioLimpia.lastIndexOf(SEPARADOR);
  if (indice === -1) return { texto: bioLimpia, frase: "" };
  return {
    texto: bioLimpia.slice(0, indice).trim(),
    frase: bioLimpia.slice(indice + SEPARADOR.length).trim(),
  };
}

export function unirBio(texto: string, frase: string): string {
  const t = texto.trim();
  const f = frase.trim();
  if (!f) return t;
  if (!t) return f;
  return `${t}${SEPARADOR}${f}`;
}
