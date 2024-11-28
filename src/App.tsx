import React, { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import ArtikelUebersicht from './components/ArtikelUebersicht';
import Warenkorb from './components/Warenkorb';
import VerkaufsUebersicht from './components/VerkaufsUebersicht';
import Zahlungsabwicklung from './components/Zahlungsabwicklung';
import { RootState } from './store';
import './App.css';

const MainContent: React.FC = () => {
  const [showVerkaufsUebersicht, setShowVerkaufsUebersicht] = useState(false);
  const artikel = useSelector((state: RootState) => state.artikel.artikel);
  const { gesamtbetrag } = useSelector((state: RootState) => state.warenkorb);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Kassen System</h1>
          <button
            onClick={() => setShowVerkaufsUebersicht(!showVerkaufsUebersicht)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showVerkaufsUebersicht ? 'Zur Kasse' : 'Verkaufsübersicht'}
          </button>
        </div>

        {showVerkaufsUebersicht ? (
          <VerkaufsUebersicht />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ArtikelUebersicht artikel={artikel} />
            </div>
            <div>
              <Warenkorb />
              {gesamtbetrag > 0 && <Zahlungsabwicklung />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <MainContent />
    </Provider>
  );
};

export default App;
