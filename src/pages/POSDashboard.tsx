import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ArtikelUebersicht from '../components/ArtikelUebersicht';
import Warenkorb from '../components/Warenkorb';
import Zahlungsabwicklung from '../components/Zahlungsabwicklung';

const POSDashboard: React.FC = () => {
  const artikel = useSelector((state: RootState) => state.artikel.artikel);
  const { gesamtbetrag } = useSelector((state: RootState) => state.warenkorb);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Kassen System</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Spalte - Artikelübersicht */}
          <div className="lg:col-span-2">
            <ArtikelUebersicht artikel={artikel} />
          </div>

          {/* Rechte Spalte - Warenkorb und Zahlungsabwicklung */}
          <div className="space-y-6">
            <Warenkorb />
            {gesamtbetrag > 0 && (
              <div className="mt-6">
                <Zahlungsabwicklung />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default POSDashboard;
