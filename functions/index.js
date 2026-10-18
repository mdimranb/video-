const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.validateKey = functions.https.onCall(async (data, context) => {
  const key = (data.key || '').toString().trim().toUpperCase();
  const deviceId = (data.deviceId || '').toString().trim();
  if (!key || !deviceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing key or deviceId');
  }

  const ref = admin.database().ref(`keys/${key}`);
  const snap = await ref.once('value');
  if (!snap.exists()) {
    throw new functions.https.HttpsError('not-found', 'Key not found');
  }

  const u = snap.val();

  if (u.blocked === true) {
    throw new functions.https.HttpsError('permission-denied', 'Key blocked');
  }

  if (u.expiresAt && u.expiresAt < Date.now()) {
    throw new functions.https.HttpsError('permission-denied', 'Key expired');
  }

  const devicesRef = ref.child('devices');
  const devicesSnap = await devicesRef.once('value');
  const devices = devicesSnap.val() || {};

  const limit = u.limit || 0;
  if (!devices[deviceId]) {
    const currentDeviceCount = Object.keys(devices).length;
    if (limit > 0 && currentDeviceCount >= limit) {
      throw new functions.https.HttpsError('resource-exhausted', 'Usage limit exceeded');
    }
    await devicesRef.child(deviceId).set({ firstSeen: Date.now(), lastSeen: Date.now() });
    const usageRef = ref.child('usageCount');
    await usageRef.transaction(current => (current || 0) + 1);
  } else {
    await devicesRef.child(deviceId + '/lastSeen').set(Date.now());
  }

  let remainDays = null;
  if (u.expiresAt) {
    remainDays = Math.max(0, Math.ceil((u.expiresAt - Date.now()) / 86400000));
  }

  return {
    success: true,
    remainDays,
    limit: limit || null,
    deviceRegistered: true
  };
});
