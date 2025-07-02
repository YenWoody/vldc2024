import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import { FcmTokens } from '/imports/api/fcm/fcmTokensApp.js'; // file này bạn đã có

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use('/api/fcm-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Thiếu token' }));
    return;
  }

  // Chống lưu trùng token
  const existing = FcmTokens.findOne({ token });
  if (!existing) {
    FcmTokens.insert({
      token,
      createdAt: new Date(),
    });
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
});