import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CONFIG_COLLECTION = "_system_config";
const SECRETS_DOC = "secrets";

export interface SystemSecrets {
  scopus_api_key?: string;
  orcid_client_id?: string;
  orcid_client_secret?: string;
  [key: string]: any;
}

/**
 * ดึงข้อมูลความลับ (Secrets) จาก Firestore
 * มีระบบ Cache เบื้องต้นในระดับ Module State
 */
let cachedSecrets: SystemSecrets | null = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getSystemSecrets(forceRefresh = false): Promise<SystemSecrets> {
  const now = Date.now();
  if (!forceRefresh && cachedSecrets && (now - lastFetch < CACHE_TTL)) {
    return cachedSecrets;
  }

  try {
    const docRef = doc(db, CONFIG_COLLECTION, SECRETS_DOC);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      cachedSecrets = snap.data() as SystemSecrets;
      lastFetch = now;
      return cachedSecrets;
    } else {
      console.warn("System secrets not found in Firestore. Falling back to environment variables.");
      // Fallback to env for transition period
      return {
        scopus_api_key: process.env.SCOPUS_API_KEY,
        orcid_client_id: process.env.ORCID_CLIENT_ID,
        orcid_client_secret: process.env.ORCID_CLIENT_SECRET,
      };
    }
  } catch (error) {
    console.error("Error fetching system secrets:", error);
    return {};
  }
}

/**
 * อัปเดตข้อมูลความลับ (เฉพาะ Admin/System)
 */
export async function updateSystemSecrets(secrets: Partial<SystemSecrets>): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, SECRETS_DOC);
  await setDoc(docRef, secrets, { merge: true });
  cachedSecrets = null; // Invalidate cache
}
