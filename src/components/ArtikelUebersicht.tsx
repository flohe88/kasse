import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { artikelHinzufuegen } from '../store/warenkorbSlice';
import { Artikel } from '../types';
import PreisDialog from './PreisDialog';

const ArtikelUebersicht: React.FC = () => {
  const dispatch = useDispatch();
  const [suchbegriff, setSuchbegriff] = useState('');
  const [ausgewaehlterArtikel, setAusgewaehlterArtikel] = useState<Artikel | null>(null);
  
  const artikel = useSelector((state: RootState) => state.artikel.liste);

  const gefilterteArtikel = artikel.filter((artikel) => 
    artikel.name.toLowerCase().includes(suchbegriff.toLowerCase())
  );

  const handleArtikelClick = (artikel: Artikel) => {
    setAusgewaehlterArtikel(artikel);
  };

  const handlePreisBestaetigt = (artikel: Artikel, preis: number) => {
    const artikelMitPreis = { ...artikel, preis };
    dispatch(artikelHinzufuegen(artikelMitPreis));
    setAusgewaehlterArtikel(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gefilterteArtikel.map((artikel) => (
          <button
            key={artikel.id}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white text-center"
            onClick={() => handleArtikelClick(artikel)}
          >
            <h3 className="text-xl font-medium">{artikel.name}</h3>
          </button>
        ))}
      </div>

      {ausgewaehlterArtikel && (
        <PreisDialog
          artikel={ausgewaehlterArtikel}
          onPreisBestaetigt={handlePreisBestaetigt}
          onAbbrechen={() => setAusgewaehlterArtikel(null)}
        />
      )}
    </div>
  );
};

export default ArtikelUebersicht;