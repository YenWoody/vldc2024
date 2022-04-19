import { Meteor }          from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const Files = new FilesCollection({
  debug: true,
  collectionName: 'Files',
  allowClientCode: true,
  storagePath: () => {
    return `../../../../../.uploads/`;
}
});

if (Meteor.isServer) {
  Files.denyClient();
  Meteor.publish('files.all', function () {
    // console.log('Files.all', Files);
    return Files.find().cursor;
  });
} else {
  Meteor.subscribe('files.all');
}

export default Files;
