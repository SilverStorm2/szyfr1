export default function shiftChar(char, shift) {
  const code = char.charCodeAt(0);
  const a = "a".charCodeAt(0);
  const z = "z".charCodeAt(0);
  const A = "A".charCodeAt(0);
  const Z = "Z".charCodeAt(0);

  if (code >= a && code <= z) {
    return String.fromCharCode((((code - a + shift) % 26) + 26) % 26 + a);
  }
  if (code >= A && code <= Z) {
    return String.fromCharCode((((code - A + shift) % 26) + 26) % 26 + A);
  }
  return char;
}


// funkcja shiftChar(char, shift) przesuwa pojedynczą literę 
// o shift pozycji w alfabecie (A–Z i a–z) z zawijaniem po 26 znakach; 
// jeśli znak nie jest literą, zwraca go bez zmian.