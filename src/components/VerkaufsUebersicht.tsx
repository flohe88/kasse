import React, { useState, useEffect } from 'react';
import { getVerkaeufeFuerTag, exportiereVerkaefeAlsCSV, loescheVerkauf } from '../services/verkaufService';
import { formatCurrency } from '../utils/format';
import type { Verkauf } from '../types';

interface VerkaufArtikel {
  artikel_name: string;
  preis: number;
  menge?: number;
}

interface Verkauf {
  id: number;
  datum: string;
  gesamtbetrag: number;
  bezahlter_betrag: number;
  rueckgeld: number;
  artikel: VerkaufArtikel[];
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
      const startDatum = new Date(selectedDate);
      startDatum.setHours(0, 0, 0, 0);
      
      const endDatum = new Date(selectedDate);
      endDatum.setHours(23, 59, 59, 999);

      const csvContent = await exportiereVerkaefeAlsCSV(startDatum, endDatum);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `verkauefe_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Fehler beim Exportieren:', err);
      setError('Fehler beim Exportieren der Verkäufe');
    }
  };

  const handleDelete = async (verkaufId: number) => {
    if (window.confirm('Möchten Sie diesen Verkauf wirklich löschen?')) {
      try {
        await loescheVerkauf(verkaufId);
        setVerkauefe(prevVerkauefe => prevVerkauefe.filter(v => v.id !== verkaufId));
        setTagesumsatz(prevUmsatz => 
          prevUmsatz - (verkauefe.find(v => v.id === verkaufId)?.gesamtbetrag || 0)
        );
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
      }
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  if (isLoading) {
    return <div>Lade Verkäufe...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Verkaufsübersicht</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Export
          </button>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-green-800">Tagesumsatz</h2>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(tagesumsatz)}</p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {verkauefe.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Keine Verkäufe an diesem Tag
          </div>
        ) : (
          verkauefe.map((verkauf) => (
            <div key={verkauf.id} className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="w-full sm:w-auto">
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(verkauf.datum).toLocaleTimeString()}
                  </p>
                  <p className="font-semibold text-lg md:text-xl">
                    Gesamtbetrag: {formatCurrency(verkauf.gesamtbetrag)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-sm md:text-base">
                      Bezahlt: {formatCurrency(verkauf.bezahlter_betrag)}
                    </p>
                    <p className="text-sm md:text-base text-green-600">
                      Rückgeld: {formatCurrency(verkauf.rueckgeld)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(verkauf.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Verkauf löschen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3">Gekaufte Artikel:</p>
                <div className="space-y-2">
                  {verkauf.artikel.map((artikel, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 text-sm md:text-base p-2 hover:bg-gray-50 rounded-lg">
                      <span className="w-full md:w-auto">{artikel.artikel_name}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        <span className="whitespace-nowrap">{artikel.menge || 1}x {formatCurrency(artikel.preis)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VerkaufsUebersicht;
