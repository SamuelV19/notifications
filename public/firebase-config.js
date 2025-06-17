// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js';

const firebaseConfig = {
  apiKey: "AIzaSyCCQCLViZj3r55Na7suZFjJwFgwWzl-YZo",
  authDomain: "notifications-34034.firebaseapp.com",
  projectId: "notifications-34034",
  storageBucket: "notifications-34034.appspot.com",
  messagingSenderId: "337223798719",
  appId: "1:337223798719:web:2f9c9c00234e90f8a0db0a",
  measurementId: "G-70B9RVFL5B"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Solicita permiso y obtiene el token FCM del dispositivo
export const solicitarPermisoNotificacion = async () => {
  try {
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") {
      console.warn("🚫 Permiso de notificación no concedido.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BGkuxC3-gC_Y28mab4Yfv1qqlvxBOurAhCdP67-n5udVxZqcNMaQOvRbyoZ1vD77Z8yQ65nLYHo0BhCgAXKbqU4"
    });

    if (token) {
      console.log("✅ Token generado:", token);
      return token;
    } else {
      console.warn("⚠️ No se obtuvo token de notificación.");
      return null;
    }
  } catch (err) {
    console.error("❌ Error al obtener el token:", err);
    return null;
  }
};

// Escucha notificaciones mientras la app está abierta
onMessage(messaging, payload => {
  console.log("📥 Notificación recibida:", payload);
});
