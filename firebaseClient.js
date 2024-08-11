import { getAnalytics, isSupported } from "firebase/analytics";
import { app } from './firebase';

// Only initialize Firebase Analytics in the browser
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}
