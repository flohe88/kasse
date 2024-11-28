import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Kategorie } from '../types';

interface KategorieState {
  liste: Kategorie[];
  ausgewaehlteKategorie: Kategorie | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: KategorieState = {
  liste: [
    {
      id: 1,
      name: 'Deko',
      erstellt_am: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Mode',
      erstellt_am: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Accessoires',
      erstellt_am: new Date().toISOString()
    }
  ],
  ausgewaehlteKategorie: null,
  isLoading: false,
  error: null,
};

const kategorieSlice = createSlice({
  name: 'kategorien',
  initialState,
  reducers: {
    kategorieHinzufuegen: (state, action: PayloadAction<Kategorie>) => {
      state.liste.push(action.payload);
    },
    kategorieAktualisieren: (state, action: PayloadAction<Kategorie>) => {
      const index = state.liste.findIndex(kategorie => kategorie.id === action.payload.id);
      if (index !== -1) {
        state.liste[index] = action.payload;
      }
    },
    kategorieLoeschen: (state, action: PayloadAction<number>) => {
      state.liste = state.liste.filter(kategorie => kategorie.id !== action.payload);
    },
    kategorieAuswaehlen: (state, action: PayloadAction<Kategorie | null>) => {
      state.ausgewaehlteKategorie = action.payload;
    },
  },
});

export const { 
  kategorieHinzufuegen, 
  kategorieAktualisieren, 
  kategorieLoeschen,
  kategorieAuswaehlen,
} = kategorieSlice.actions;

export default kategorieSlice.reducer;
