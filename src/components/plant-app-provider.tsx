import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PlantAnalysis, ScanRecord } from "@/lib/plant-analysis";
import { saveScanHistory } from "@/lib/plant-analysis";

type PlantSession = {
  capturedFile: File | null;
  imageUrl: string | null;
  analysis: PlantAnalysis | null;
  record: ScanRecord | null;
};

type PlantAppContextValue = {
  session: PlantSession;
  historySelection: ScanRecord | null;
  setCapturedImage: (file: File) => void;
  saveAnalysis: (analysis: PlantAnalysis) => ScanRecord;
  selectHistoryRecord: (record: ScanRecord) => void;
  clearCurrentScan: () => void;
};

const PlantAppContext = createContext<PlantAppContextValue | null>(null);

export function PlantAppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PlantSession>({
    capturedFile: null,
    imageUrl: null,
    analysis: null,
    record: null,
  });
  const [historySelection, setHistorySelection] = useState<ScanRecord | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const setCapturedImage = useCallback((file: File) => {
    const imageUrl = URL.createObjectURL(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = imageUrl;
    setHistorySelection(null);
    setSession({ capturedFile: file, imageUrl, analysis: null, record: null });
  }, []);

  const saveAnalysis = useCallback((analysis: PlantAnalysis) => {
    const record = saveScanHistory(analysis);
    setHistorySelection(null);
    setSession((previous) => ({ ...previous, analysis, record }));
    return record;
  }, []);

  const selectHistoryRecord = useCallback((record: ScanRecord) => {
    setHistorySelection(record);
  }, []);

  const clearCurrentScan = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setHistorySelection(null);
    setSession({ capturedFile: null, imageUrl: null, analysis: null, record: null });
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ session, historySelection, setCapturedImage, saveAnalysis, selectHistoryRecord, clearCurrentScan }),
    [session, historySelection, setCapturedImage, saveAnalysis, selectHistoryRecord, clearCurrentScan],
  );

  return <PlantAppContext.Provider value={value}>{children}</PlantAppContext.Provider>;
}

export function usePlantApp(): PlantAppContextValue {
  const context = useContext(PlantAppContext);
  if (!context) throw new Error("Plant app state must be used inside PlantAppProvider.");
  return context;
}