import React, { useState } from 'react';
import { Artikel } from '../types';
import NummerTastatur from './NummerTastatur';

interface PreisDialogProps {
  artikel: Artikel;
  onConfirm: (menge: number) => void;
  onClose: () => void;
}

const PreisDialog: React.FC<PreisDialogProps> = ({ artikel, onConfirm, onClose }) => {
  const [menge, setMenge] = useState<string>('1');

  const handleBestaetigen = () => {
    const mengeNumeric = parseInt(menge, 10);
    if (!isNaN(mengeNumeric) && mengeNumeric > 0) {
      onConfirm(mengeNumeric);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Menge eingeben für {artikel.name}</h2>
        <p className="text-gray-600 mb-4">Preis pro Stück: {artikel.preis.toFixed(2)} €</p>
        
        <div className="mb-6">
          <NummerTastatur
            wert={menge}
            onWertChange={setMenge}
            onBestaetigen={handleBestaetigen}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-lg font-semibold">
            Gesamt: {(parseFloat(menge || '0') * artikel.preis).toFixed(2)} €
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleBestaetigen}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreisDialog;
