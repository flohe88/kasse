export interface Artikel {
  id: number;
  name: string;
  preis: number;
  kategorie_id: number;
  erstellt_am: string;
}

export interface Kategorie {
  id: number;
  name: string;
  erstellt_am: string;
}

export interface WarenkorbArtikel {
  artikel: Artikel;
  menge: number;
}

export interface Verkauf {
  id: number;
  datum: string;
  gesamtbetrag: number;
  bezahlter_betrag: number;
  rueckgeld: number;
  artikel: {
    artikel_id: number;
    artikel_name: string;
    preis: number;
    menge: number;
  }[];
}
