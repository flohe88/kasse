import React, { useState, useEffect } from 'react';
import { getVerkaeufeFuerTag, exportiereVerkaefeAlsCSV, loescheVerkauf } from '../services/verkaufService';
import { formatCurrency } from '../utils/format';
import type { Verkauf } from '../types';

interface VerkaufArtikelAnzeige {
  artikel_name: string;
  preis: number;
  menge: number;
}

const VerkaufsUebersicht: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [verkauefe, setVerkauefe] = useState<Verkauf[]>([]);
  const [tagesumsatz, setTagesumsatz] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVerkauefe = async () => {
    setIsLoading(true);
    try {
      const verkauefe = await getVerkaeufeFuerTag(selectedDate);
      const verkaeufeMitArtikeln = verkauefe.filter(verkauf => {
        try {
          const artikel = Array.isArray(verkauf.artikel) 
            ? verkauf.artikel 
            : JSON.parse(verkauf.artikel || '[]');
          return artikel.length > 0;
        } catch (e) {
          console.error('Fehler beim Parsen der Artikel für Verkauf', verkauf.id, ':', e);
          return false;
        }
      });
      setVerkauefe(verkaeufeMitArtikeln);
      const gesamtUmsatz = verkaeufeMitArtikeln.reduce((sum, v) => sum + v.gesamtbetrag, 0);
      setTagesumsatz(gesamtUmsatz);
    } catch (error) {
      console.error('Fehler beim Laden der Verkäufe:', error);
      setError('Fehler beim Laden der Verkäufe');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerkauefe();
  }, [selectedDate]);

  const handleExport = async () => {
    try {
      await exportiereVerkaefeAlsCSV(selectedDate);
    } catch (error) {
      console.error('Fehler beim Exportieren:', error);
      setError('Fehler beim Exportieren der Verkäufe');
    }
  };

  const handleDelete = async (verkaufId: number) => {
    if (!window.confirm('Möchten Sie diesen Verkauf wirklich löschen?')) {
      return;
    }

    try {
      await loescheVerkauf(verkaufId);
      await loadVerkauefe();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setError('Fehler beim Löschen des Verkaufs');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Lädt...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-4 text-blue-600 hover:text-blue-800"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <span className="ml-4 font-bold">
            Tagesumsatz: {formatCurrency(tagesumsatz)}
          </span>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Als CSV exportieren
        </button>
      </div>

      <div className="space-y-4">
        {verkauefe.map((verkauf) => (
          <div key={verkauf.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {new Date(verkauf.datum).toLocaleString()}
                </p>
                <p className="font-bold">Gesamtbetrag: {formatCurrency(verkauf.gesamtbetrag)}</p>
                <p className="text-sm">
                  Bezahlt: {formatCurrency(verkauf.bezahlter_betrag)} | 
                  Rückgeld: {formatCurrency(verkauf.rueckgeld)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(verkauf.id)}
                className="text-red-600 hover:text-red-800"
              >
                Löschen
              </button>
            </div>

            <div className="border-t pt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Artikel</th>
                    <th className="pb-2">Preis</th>
                    <th className="pb-2">Menge</th>
                    <th className="pb-2 text-right">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {verkauf.artikel.map((artikel, index) => (
                    <tr key={index}>
                      <td>{artikel.artikel_name}</td>
                      <td>{formatCurrency(artikel.preis)}</td>
                      <td>{artikel.menge}</td>
                      <td className="text-right">
                        {formatCurrency(artikel.preis * artikel.menge)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerkaufsUebersicht;
