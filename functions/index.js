// functions/index.js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ✅ Función programada que corre cada minuto
exports.sendScheduledNotifications = onSchedule(
  {
    schedule: "* * * * *",
    timeZone: "America/Bogota",
  },
  async (event) => {
    const now = admin.firestore.Timestamp.now();

    const pendientes = await db
      .collection("recordatorios")
      .where("scheduledTime", "<=", now)
      .where("sent", "==", false)
      .get();

    if (pendientes.empty) {
      console.log("⏳ No hay notificaciones por enviar.");
      return;
    }

    const batch = db.batch();

    pendientes.forEach((doc) => {
      const data = doc.data();
      const payload = {
        notification: {
          title: "📞 Recordatorio",
          body: data.mensaje || "Es hora de hacer tus llamadas ministeriales 🙏🔥",
        },
      };

      admin.messaging().sendToDevice(data.token, payload);
      batch.update(doc.ref, { sent: true });
    });

    await batch.commit();
    console.log(`✅ Enviadas ${pendientes.size} notificaciones.`);
  }
);

// ✅ Endpoint HTTP para registrar recordatorios desde frontend
exports.addRecordatorio = onRequest(async (req, res) => {
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
