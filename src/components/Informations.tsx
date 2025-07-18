function Informations() {
    return (
        <div>
            <h3>Informace</h3>
           <ul className="list-disc ml-4 space-y-2">
               <li>
                     Stránku netřeba aktualizovat (znovu načítat), data se aktualizují při každém pohybu okamžitě automaticky.
               </li>
                <li>
                    Zatím funguje filtrování a řazení vzestupně a sestupně klikáním na názvy sloupců.
                </li>
               <li>
                   V budoucí verzi bude možné rozkliknout jednotlivé řádky a zobrazit historii pohybů.
               </li>
           </ul>
        </div>
    );
}

export default Informations;