import shiftChar from "./shiftChar";

export default function caesarShift(text, shift) {
  return [...text].map((c) => shiftChar(c, shift)).join("");
}

// funkcja caesarShift(text, shift) szyfruje/odszyfrowuje tekst szyfrem Cezara: 
// przesuwa każdą literę alfabetu o shift (0–25), 
// zostawiając znaki niebędące literami bez zmian (wykorzystuje shiftChar)