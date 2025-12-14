export default function extractEmail(text) {
  const normalized = text
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\s+/g, " ");

  const match = normalized.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return match ? match[0] : null;
}

//funkcja extractEmail(text) wyciąga pierwszy adres e-mail z tekstu: 
// najpierw normalizuje zapis (usuwa spacje wokół @ i .), 
// a potem dopasowuje wzorcem regex; zwraca znaleziony e-mail albo null.