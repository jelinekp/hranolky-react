import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export interface AppConfigData {
  version: string;
  versionCode: number;
  releaseNotes: string;
  downloadUrl: string;
}

export const useAppConfig = () => {
  const [appConfig, setAppConfig] = useState<AppConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configRef = doc(db, 'AppConfig', 'latest');

    const unsubscribe = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAppConfig({
          version: data.version || '',
          versionCode: data.versionCode || 0,
          releaseNotes: data.releaseNotes || '',
          downloadUrl: data.downloadUrl || ''
        });
      } else {
        setAppConfig(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching app config:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { appConfig, loading };
};
