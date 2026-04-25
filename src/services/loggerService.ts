import { collection, addDoc, serverTimestamp, db } from '../firebase';
import { User } from 'firebase/auth';

export const logAction = async (user: User | null, action: string, details: any, oldValue?: any, newValue?: any) => {
  if (!user) return;
  try {
    await addDoc(collection(db, 'logs'), {
      userId: user.uid,
      userEmail: user.email,
      action,
      details,
      oldValue: oldValue || null,
      newValue: newValue || null,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Logging failed", err);
  }
};
