import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Artikel } from '../types';

interface ArtikelState {
  artikel: Artikel[];
  ausgewaehlterArtikel: Artikel | null;
}

const initialState: ArtikelState = {
  artikel: [
    // Mode (Kategorie 2)
    {
      id: 1,
      name: 'T-Shirt Basic',
      preis: 19.99,
      kategorie_id: 2,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Jeans Classic',
      preis: 49.99,
      kategorie_id: 2,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Pullover Casual',
      preis: 39.99,
      kategorie_id: 2,
      erstellt_am: new Date().toISOString()
    },
    // Deko (Kategorie 1)
    {
      id: 4,
      name: 'Kerzenhalter Gold',
      preis: 24.99,
      kategorie_id: 1,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Vase Modern',
      preis: 29.99,
      kategorie_id: 1,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Wandbild Abstract',
      preis: 34.99,
      kategorie_id: 1,
      erstellt_am: new Date().toISOString()
    },
    // Accessoires (Kategorie 3)
    {
      id: 7,
      name: 'Halskette Silber',
      preis: 15.99,
      kategorie_id: 3,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 8,
      name: 'Armband Gold',
      preis: 19.99,
      kategorie_id: 3,
      erstellt_am: new Date().toISOString()
    },
    {
      id: 9,
      name: 'Ohrringe Crystal',
      preis: 12.99,
      kategorie_id: 3,
      erstellt_am: new Date().toISOString()
    }
  ],
  ausgewaehlterArtikel: null
};

const artikelSlice = createSlice({
  name: 'artikel',
  initialState,
  reducers: {
    setAusgewaehlterArtikel: (state, action: PayloadAction<Artikel | null>) => {
      state.ausgewaehlterArtikel = action.payload;
    },
    addArtikel: (state, action: PayloadAction<Artikel>) => {
      state.artikel.push(action.payload);
    },
    updateArtikel: (state, action: PayloadAction<Artikel>) => {
      const index = state.artikel.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.artikel[index] = action.payload;
      }
    },
    deleteArtikel: (state, action: PayloadAction<number>) => {
      state.artikel = state.artikel.filter(a => a.id !== action.payload);
      if (state.ausgewaehlterArtikel?.id === action.payload) {
        state.ausgewaehlterArtikel = null;
      }
    }
  }
});

export const {
  setAusgewaehlterArtikel,
  addArtikel,
  updateArtikel,
  deleteArtikel
} = artikelSlice.actions;

export default artikelSlice.reducer;
