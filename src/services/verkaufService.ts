import { supabase } from './supabase';
import { Verkauf } from '../types';

const VERKAUEFE_KEY = 'verkaufe';

const formatNumber = (num: number): string => {
  return Number(num).toFixed(2);
};

export const speichereVerkauf = async (verkauf: Omit<Verkauf, 'id'>): Promise<Verkauf> => {
  try {
    const supabaseVerkauf = {
      datum: new Date().toISOString(),
      gesamtbetrag: formatNumber(verkauf.gesamtbetrag),
      bezahlter_betrag: formatNumber(verkauf.bezahlter_betrag),
      rueckgeld: formatNumber(verkauf.rueckgeld),
      artikel: JSON.stringify(verkauf.artikel.map(artikel => ({
        artikel_name: artikel.artikel_name,
        preis: formatNumber(artikel.preis),
        menge: artikel.menge || 1
      })))
    };

    console.log('Zu speichernder Verkauf:', supabaseVerkauf);

    const { data, error } = await supabase
      .from('verkaufe')
      .insert([supabaseVerkauf])
      .select()
      .single();

    if (error) {
      console.error('Supabase Fehler:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Keine Daten nach dem Insert erhalten');
    }

    // Zusätzlich Artikel in verkauf_artikel speichern
    const artikelEintraege = verkauf.artikel.map(artikel => ({
      verkauf_id: data.id,
      artikel_name: artikel.artikel_name,
      preis: formatNumber(artikel.preis),
      menge: artikel.menge || 1
    }));

    const { error: artikelError } = await supabase
      .from('verkauf_artikel')
      .insert(artikelEintraege);

    if (artikelError) {
      console.error('Fehler beim Speichern der Artikel:', artikelError);
      throw artikelError;
    }

    const neuerVerkauf: Verkauf = {
      ...verkauf,
      id: data.id,
      datum: data.datum
    };

    return neuerVerkauf;
  } catch (error) {
    console.error('Vollständiger Fehler:', error);
    throw error;
  }
};

export const getVerkauefe = (): Verkauf[] => {
  try {
    return JSON.parse(localStorage.getItem(VERKAUEFE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getVerkaeufeFuerTag = async (datum: string): Promise<Verkauf[]> => {
  try {
    console.log('Lade Verkäufe für Datum:', datum);
    const startDatum = new Date(datum);
    startDatum.setHours(0, 0, 0, 0);
    
    const endDatum = new Date(datum);
    endDatum.setHours(23, 59, 59, 999);

    const { data: verkauefe, error } = await supabase
      .from('verkaufe')
      .select('*')
      .gte('datum', startDatum.toISOString())
      .lte('datum', endDatum.toISOString())
      .order('datum', { ascending: true });

    if (error) {
      console.error('Fehler beim Abrufen der Verkäufe:', error);
      throw error;
    }

    if (!verkauefe) {
      console.log('Keine Verkäufe gefunden');
      return [];
    }

    // Konvertiere die Verkäufe
    const konvertierteVerkauefe = verkauefe.map(verkauf => {
      try {
        let artikelArray = Array.isArray(verkauf.artikel) 
          ? verkauf.artikel 
          : JSON.parse(verkauf.artikel || '[]');
        
        return {
          ...verkauf,
          artikel: artikelArray,
          gesamtbetrag: Number(verkauf.gesamtbetrag),
          bezahlter_betrag: Number(verkauf.bezahlter_betrag),
          rueckgeld: Number(verkauf.rueckgeld)
        };
      } catch (e) {
        console.error('Fehler bei der Konvertierung des Verkaufs', verkauf.id, ':', e);
        return null;
      }
    }).filter((v): v is Verkauf => v !== null);

    return konvertierteVerkauefe;
  } catch (error) {
    console.error('Fehler beim Laden der Verkäufe:', error);
    throw error;
  }
};

export const loescheVerkauf = async (verkaufId: number): Promise<void> => {
  try {
    const { error: deleteArtikelError } = await supabase
      .from('verkauf_artikel')
      .delete()
      .eq('verkauf_id', verkaufId);

    if (deleteArtikelError) {
      throw new Error('Fehler beim Löschen der Verkaufsartikel: ' + deleteArtikelError.message);
    }

    const { error: deleteVerkaufError } = await supabase
      .from('verkaufe')
      .delete()
      .eq('id', verkaufId);

    if (deleteVerkaufError) {
      throw new Error('Fehler beim Löschen des Verkaufs: ' + deleteVerkaufError.message);
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Verkaufs:', error);
    throw error;
  }
};

export const exportiereVerkaefeAlsCSV = async (startDatum: Date, endDatum: Date): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('verkaufe')
      .select('*')
      .gte('datum', startDatum.toISOString())
      .lte('datum', endDatum.toISOString());

    if (error) throw error;

    const csvHeader = 'Datum,Uhrzeit,Artikelname,Preis,Menge,Gesamtbetrag\n';
    const csvRows = data.flatMap(verkauf => {
      const datum = new Date(verkauf.datum);
      const datumFormatiert = datum.toLocaleDateString('de-DE');
      const uhrzeitFormatiert = datum.toLocaleTimeString('de-DE');

      const artikel = typeof verkauf.artikel === 'string' 
        ? JSON.parse(verkauf.artikel) 
        : verkauf.artikel;

      return artikel.map((artikel: { artikel_name: string; preis: number; menge?: number }) => {
        const menge = artikel.menge || 1;
        const einzelpreis = Number(artikel.preis);
        const gesamtpreis = einzelpreis * menge;
        
        return [
          datumFormatiert,
          uhrzeitFormatiert,
          artikel.artikel_name.replace(/,/g, ';'),
          formatNumber(einzelpreis),
          menge,
          formatNumber(gesamtpreis)
        ].join(',');
      });
    }).join('\n');

    return csvHeader + csvRows;
  } catch (error) {
    console.error('Fehler beim Exportieren:', error);
    return '';
  }
};