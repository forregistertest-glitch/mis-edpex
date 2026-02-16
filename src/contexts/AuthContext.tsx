"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ─── Types ─────────────────────────────────────────────────────
type UserRole = "admin" | "reviewer" | "user" | null;

interface AuthContextType {
    user: User | null;
    userRole: UserRole;
    userName: string | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    userName: null,
    loading: true,
    error: null,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if email is in authorized_users collection
    const checkAuthorization = async (firebaseUser: User): Promise<boolean> => {
        try {
            const email = firebaseUser.email;
            if (!email) return false;

            const userDoc = await getDoc(doc(db, "authorized_users", email));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserRole(data.role || "user");
                setUserName(data.name || firebaseUser.displayName || email);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Authorization check failed:", err);
            return false;
        }
    };

    // Listen to auth state
    useEffect(() => {
        const initAuth = async () => {
            // Force session persistence (User must login every time tab/browser is closed)
            const { setPersistence, inMemoryPersistence } = await import("firebase/auth");
            await setPersistence(auth, inMemoryPersistence);

            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const authorized = await checkAuthorization(firebaseUser);
                    if (authorized) {
                        setUser(firebaseUser);
                        setError(null);
                        // Log Success
                        import("@/lib/data-service").then(m => m.addLoginLog(firebaseUser.email!, true)).catch(console.error);
                    } else {
                        // Not in whitelist — sign out immediately
                        // Log Failure
                        import("@/lib/data-service").then(m => m.addLoginLog(firebaseUser.email!, false)).catch(console.error);
                        await firebaseSignOut(auth);
                        setUser(null);
                        setUserRole(null);
                        setUserName(null);
                        setError(
                            `อีเมล ${firebaseUser.email} ไม่มีสิทธิ์เข้าใช้งานระบบ กรุณาติดต่อผู้ดูแลระบบ`
                        );
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                    setUserName(null);
                }
                setLoading(false);
            });
            return unsubscribe;
        };

        const cleanup = initAuth();
        return () => { cleanup.then(unsub => unsub && unsub()); };
    }, []);

    // Google Sign-In
    const signInWithGoogle = async () => {
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            // Persistence is already set in useEffect, but setting it here again ensures it applies to this sign-in flow
            const { setPersistence, inMemoryPersistence } = await import("firebase/auth");
            await setPersistence(auth, inMemoryPersistence);

            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the rest
        } catch (err: any) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่");
                console.error("Sign-in error:", err);
            }
        }
    };

    // Sign Out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setError(null);
        } catch (err) {
            console.error("Sign-out error:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRole, userName, loading, error, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
