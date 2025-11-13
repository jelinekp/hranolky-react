function Informations() {
  return (
    <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg space-y-1">
      <h3>Informace</h3>
      <ul className="list-disc ml-4 space-y-1">
        <li>
          Stránku netřeba aktualizovat (znovu načítat), data se aktualizují při každém pohybu okamžitě automaticky.
        </li>
        <li>
          Řazení vzestupně a sestupně funguje kliknutím na názvy sloupců.
        </li>
        <li>
          Jednotlivé řádky lze rozkliknout a zobrazit historii pohybů.
        </li>
        <li>
          Součty jsou dole v tabulce.
        </li>
        <li>
          <a href="https://jelinekp.cz/vypocet_sparovky/x_nejlepsich.html">Aplikace pro výpočet ideální kombinace
            hranolků do spárovky →</a>
        </li>
      </ul>
    </div>
  );
}

export default Informations;