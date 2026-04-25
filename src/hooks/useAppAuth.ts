import { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User as FirebaseUser
} from '../firebase';
import { AppUser } from '../types';

const ALLOWED_EMAILS = ['vladimir.chuguev@gmail.com', 'feelup.balloons@gmail.com'];

export function useAppAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserMetadata: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (unsubUserMetadata) {
        unsubUserMetadata();
        unsubUserMetadata = null;
      }

      if (!u) {
        setCurrentUserData(null);
        setLoading(false);
      } else {
        const userRef = doc(db, 'users', u.uid);
        
        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists() && u.email && ALLOWED_EMAILS.includes(u.email)) {
            const role = u.email === "vladimir.chuguev@gmail.com" ? "admin" : "manager";
            await setDoc(userRef, {
              email: u.email,
              displayName: u.displayName,
              role: role,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Initial doc check failed", err);
        }

        unsubUserMetadata = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (u.email === "vladimir.chuguev@gmail.com" && data.role !== "admin") {
              updateDoc(userRef, { role: "admin" });
            }
            setCurrentUserData({ id: docSnap.id, ...data } as AppUser);
          } else if (u.email && !ALLOWED_EMAILS.includes(u.email)) {
            setCurrentUserData({ id: 'unauthorized', email: u.email, role: 'none' } as any);
          }
          setLoading(false);
        }, (err) => {
          console.error("User listener failed", err);
          handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserMetadata) unsubUserMetadata();
    };
  }, []);

  return { user, currentUserData, loading };
}
