import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { warenkorbLeeren, setBezahlungAbgeschlossen } from '../store/warenkorbSlice';
import NummerTastatur from './NummerTastatur';
import { erstelleVerkauf } from '../services/verkaufService';
import type { Verkauf } from '../types';

const Zahlungsabwicklung: React.FC = () => {
  const dispatch = useDispatch();
  const { artikel, gesamtbetrag } = useSelector((state: RootState) => state.warenkorb);
  const [bezahlterBetrag, setBezahlterBetrag] = useState<string>('');
  const [rueckgeld, setRueckgeld] = useState<number>(0);
  const [showRueckgeld, setShowRueckgeld] = useState<boolean>(false);

  const handleBezahlung = async () => {
    const bezahlt = parseFloat(bezahlterBetrag.replace(',', '.'));
    if (isNaN(bezahlt) || bezahlt < gesamtbetrag) {
      alert('Bitte geben Sie einen ausreichenden Betrag ein.');
      return;
    }

    const rueckgeldBetrag = bezahlt - gesamtbetrag;
    setRueckgeld(rueckgeldBetrag);
    setShowRueckgeld(true);

    // Verkauf erstellen
    const verkaufsDaten: Verkauf = {
      id: Date.now(), // Temporäre ID, wird vom Backend überschrieben
      datum: new Date().toISOString(),
      gesamtbetrag,
      bezahlter_betrag: bezahlt,
      rueckgeld: rueckgeldBetrag,
      artikel: artikel.map(item => ({
        artikel_id: item.artikel.id,
        artikel_name: item.artikel.name,
        preis: item.artikel.preis,
        menge: item.menge
      }))
    };

    try {
      await erstelleVerkauf(verkaufsDaten);
      dispatch(setBezahlungAbgeschlossen(true));
      dispatch(warenkorbLeeren());
      setBezahlterBetrag('');
      setShowRueckgeld(true);
    } catch (error) {
      console.error('Fehler beim Erstellen des Verkaufs:', error);
      alert('Fehler beim Speichern des Verkaufs. Bitte versuchen Sie es erneut.');
    }
  };

  const handleWertChange = (wert: string) => {
    setBezahlterBetrag(wert);
    setShowRueckgeld(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Zahlungsabwicklung</h2>
      <div className="mb-4">
        <p className="text-lg font-semibold">Gesamtbetrag: {gesamtbetrag.toFixed(2)} €</p>
      </div>

      <div className="mb-6">
        <NummerTastatur
          wert={bezahlterBetrag}
          onWertChange={handleWertChange}
          onBestaetigen={handleBezahlung}
        />
      </div>

      {showRueckgeld && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-lg font-semibold text-green-800">
            Rückgeld: {rueckgeld.toFixed(2)} €
          </p>
        </div>
      )}
    </div>
  );
};

export default Zahlungsabwicklung;
