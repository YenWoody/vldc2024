import { Meteor }          from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const Files = new FilesCollection({
  debug: true,
  collectionName: 'Files',
  allowClientCode: true,
  storagePath: () => {
    return `../../../../../.uploads/`;
  },
  onBeforeUpload: file => {
    // Giới hạn định dạng file
    if (/zip|csv|txt/i.test(file.extension)) {
      return true;
    } else {
      return 'Vui lòng chọn file có đuôi zip, csv hoặc txt';
    }
  },
});

if (Meteor.isServer) {
  Files.denyClient();
  Meteor.publish('files.all', function () {
    return Files.find().cursor;
  });
} else {
  Meteor.subscribe('files.all');
}

export default Files;
