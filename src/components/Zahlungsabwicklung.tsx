import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { warenkorbLeeren } from '../store/warenkorbSlice';
import { speichereVerkauf } from '../services/verkaufService';
import { formatCurrency } from '../utils/format';
import type { CartItem, Verkauf } from '../types';

const Zahlungsabwicklung: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.warenkorb.artikel);
  const [bezahlterBetrag, setBezahlterBetrag] = useState<string>('');
  const [rueckgeld, setRueckgeld] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const gesamtbetrag = cart.reduce((sum, item) => sum + item.artikel.preis * item.menge, 0);

  useEffect(() => {
    const bezahlt = parseFloat(bezahlterBetrag) || 0;
    setRueckgeld(bezahlt - gesamtbetrag);
  }, [bezahlterBetrag, gesamtbetrag]);

  const handleBezahltChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.,]/g, '');
    setBezahlterBetrag(value);
  };

  const handleZahlungBestaetigen = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const bezahlt = parseFloat(bezahlterBetrag) || 0;
      
      if (bezahlt < gesamtbetrag) {
        setError('Der bezahlte Betrag ist zu niedrig');
        return;
      }

      const verkauf: Verkauf = {
        datum: new Date().toISOString(),
        gesamtbetrag,
        bezahlter_betrag: bezahlt,
        rueckgeld: Math.max(0, bezahlt - gesamtbetrag),
        artikel: cart.map(item => ({
          artikel_id: item.artikel.id,
          artikel_name: item.artikel.name,
          preis: item.artikel.preis,
          menge: item.menge
        }))
      };

      await speichereVerkauf(verkauf);
      dispatch(warenkorbLeeren());
      navigate('/verkaufsübersicht');
    } catch (err) {
      console.error('Fehler bei der Zahlungsabwicklung:', err);
      setError('Fehler bei der Zahlungsabwicklung');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAbbrechen = () => {
    navigate('/');
  };

  const schnellWahlBetrag = (betrag: number) => {
    setBezahlterBetrag(betrag.toString());
  };

  const schnellwahlBetraege = [5, 10, 20, 50, 100, 200];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Zahlungsabwicklung</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Warenkorb Übersicht</h2>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.artikel.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-medium">{item.artikel.name}</span>
                <span className="text-gray-600 ml-2">({item.menge}x)</span>
              </div>
              <span>{formatCurrency(item.artikel.preis * item.menge)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Gesamtbetrag:</span>
            <span>{formatCurrency(gesamtbetrag)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Schnellwahl Beträge</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {schnellwahlBetraege.map((betrag) => (
            <button
              key={betrag}
              onClick={() => schnellWahlBetrag(betrag)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded transition-colors"
            >
              {formatCurrency(betrag)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="bezahlt" className="block text-sm font-medium text-gray-700 mb-1">
              Bezahlter Betrag
            </label>
            <input
              type="text"
              id="bezahlt"
              value={bezahlterBetrag}
              onChange={handleBezahltChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Rückgeld:</span>
            <span className={rueckgeld >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(Math.max(0, rueckgeld))}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleZahlungBestaetigen}
              disabled={isProcessing || parseFloat(bezahlterBetrag) < gesamtbetrag}
              className={`flex-1 py-3 px-6 rounded-lg text-white font-medium transition-colors
                ${isProcessing || parseFloat(bezahlterBetrag) < gesamtbetrag
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isProcessing ? 'Wird verarbeitet...' : 'Zahlung bestätigen'}
            </button>
            <button
              onClick={handleAbbrechen}
              disabled={isProcessing}
              className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Zahlungsabwicklung;
