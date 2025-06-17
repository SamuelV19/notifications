const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

// Express app para manejar CORS correctamente
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 🔥 Endpoint HTTP para registrar recordatorios
app.post("/addRecordatorio", async (req, res) => {
  try {
    const { token, scheduledTime, mensaje } = req.body;

    if (!token || !scheduledTime) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    await db.collection("recordatorios").add({
      token,
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
      mensaje: mensaje || "Es hora de hacer tus llamadas ministeriales 🙏🔥",
      sent: false,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al guardar recordatorio:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔄 Ejecutar cada minuto: envía notificaciones pendientes
exports.sendScheduledNotifications = onSchedule(
  {
    schedule: "* * * * *",
    timeZone: "America/Bogota",
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const pendientes = await db
      .collection("recordatorios")
      .where("scheduledTime", "<=", now)
      .where("sent", "==", false)
      .get();

    if (pendientes.empty) {
      console.log("⏳ No hay notificaciones pendientes.");
      return;
    }

    const batch = db.batch();

    for (const doc of pendientes.docs) {
      const data = doc.data();

      const payload = {
        notification: {
          title: "📞 Recordatorio",
          body: data.mensaje || "Es hora de hacer tus llamadas ministeriales 🙏🔥",
        },
      };

      try {
        await admin.messaging().sendToDevice(data.token, payload);
        batch.update(doc.ref, { sent: true });
        console.log("✅ Enviada notificación a:", data.token);
      } catch (err) {
        console.error("❌ Error enviando notificación:", err);
      }
    }

    await batch.commit();
    console.log(`✅ Notificaciones enviadas: ${pendientes.size}`);
  }
);

// Exponer la app Express con CORS habilitado
exports.api = onRequest(app);
