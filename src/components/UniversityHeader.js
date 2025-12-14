import React from "react";
import AcademicMark from "./AcademicMark";

export default function UniversityHeader() {
  return (
    <header className="uniHeader">
      <div className="uniHeader__inner">
        <AcademicMark className="uniHeader__mark" title="Znak uczelniany" />
        <div className="uniHeader__text">
          <div className="uniHeader__kicker">Zadanie konkursowe</div>
          <div className="uniHeader__title">Brute-force szyfr (26 przesunięć)</div>
          <div className="uniHeader__subtitle">
            Organizatorem Konkursu jest TUKANO SOFTWARE HOUSE SP.
          </div>
        </div>
      </div>
    </header>
  );
}

