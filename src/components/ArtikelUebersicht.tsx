import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { artikelHinzufuegen } from '../store/warenkorbSlice';
import type { Artikel } from '../types';
import PreisDialog from './PreisDialog';

interface ArtikelUebersichtProps {
  artikel?: Artikel[];
}

const ArtikelUebersicht: React.FC<ArtikelUebersichtProps> = ({ artikel = [] }) => {
  const dispatch = useDispatch();
  const [suchbegriff, setSuchbegriff] = useState('');
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
  const [showPreisDialog, setShowPreisDialog] = useState(false);

  const gefilterteArtikel = (artikel || []).filter((artikel) => 
    artikel.name.toLowerCase().includes(suchbegriff.toLowerCase())
  );

  const handleArtikelClick = (artikel: Artikel) => {
    setSelectedArtikel(artikel);
    setShowPreisDialog(true);
  };

  const handlePreisDialogClose = () => {
    setShowPreisDialog(false);
    setSelectedArtikel(null);
  };

  const handlePreisDialogConfirm = (menge: number) => {
    if (selectedArtikel) {
      dispatch(artikelHinzufuegen(selectedArtikel));
      // Wenn mehrere Artikel hinzugefügt werden sollen, dispatche die Aktion mehrmals
      for (let i = 1; i < menge; i++) {
        dispatch(artikelHinzufuegen(selectedArtikel));
      }
    }
    handlePreisDialogClose();
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Artikel suchen..."
          className="w-full p-2 border rounded-lg"
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {gefilterteArtikel.map((artikel) => (
          <button
            key={artikel.id}
            onClick={() => handleArtikelClick(artikel)}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="font-semibold mb-2 truncate">{artikel.name}</h3>
            <p className="text-green-600 font-medium">{artikel.preis.toFixed(2)} €</p>
          </button>
        ))}
      </div>

      {showPreisDialog && selectedArtikel && (
        <PreisDialog
          artikel={selectedArtikel}
          onClose={handlePreisDialogClose}
          onConfirm={handlePreisDialogConfirm}
        />
      )}
    </div>
  );
};

export default ArtikelUebersicht;
