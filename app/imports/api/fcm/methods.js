// 📁 /imports/api/fcm/methods.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { sendNotificationToTopic, subscribeToTopic,unsubscribeFromTopic } from './server.js';

Meteor.methods({
    'fcm.registerPushToken'(token) {
    check(token, String);
    const userId = this.userId;

    if (!userId) throw new Meteor.Error('unauthorized', 'Bạn cần đăng nhập');

    Meteor.users.update(userId, {
      $set: {
        'profile.fcmToken': token,
        'profile.subscribed': true
      }
    });

    return true;
  },

  'fcm.unregisterPushToken'() {
    const userId = this.userId;

    if (!userId) throw new Meteor.Error('unauthorized', 'Bạn cần đăng nhập');

    Meteor.users.update(userId, {
      $unset: {
        'profile.fcmToken': "",
        'profile.subscribed': ""
      }
    });

    return true;
  },
  'fcm.sendToTopic'(topic, title, body) {
        check(topic, String);
    check(title, String);
    check(body, String);
    return sendNotificationToTopic(topic, title, body);
  },
  'fcm.subscribeToTopic'(token, topic) {
    check(token, String);
    check(topic, String);
    return subscribeToTopic(token, topic);
  },
   'fcm.unsubscribeFromTopic'(token, topic) {
    check(token, String);
    check(topic, String);
    return unsubscribeFromTopic(token, topic);
  },
  'fcm.subscribeToken'(token, topic) {
    check(token, String);
    check(topic, String);
    if (!this.userId) {
      throw new Meteor.Error('unauthorized', 'Phải đăng nhập để subscribe');
    }
    return subscribeToTopic(token, topic);
  }
});
