import { Meteor }          from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const Files = new FilesCollection({
  debug: true,
  collectionName: 'Files',
  allowClientCode: true,
  storagePath: () => {
    return `../../../../../public/uploads/`;
}
  // Disallow remove files from Client
  // onBeforeUpload: function (file) {
  //   // Allow upload files under 10MB, and only in png/jpg/jpeg formats
  //   if (file.size <= 1024 * 1024 * 10 && /png|jpe?g/i.test(file.extension)) {
  //     return true;
  //   }
  //   return 'Please upload image, with size equal or less than 10MB';
  // }
});

if (Meteor.isServer) {
  Files.denyClient();
  Meteor.publish('files.all', function () {
    console.log('Files.all', Files.find().cursor);
    return Files.find().cursor;
  });
} else {
  Meteor.subscribe('files.all');
}

export default Files;
