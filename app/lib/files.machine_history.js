import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

const FilesMachineHistory = new FilesCollection({
  debug: true,
  collectionName: "FilesMachineHistory",
  allowClientCode: true,
  storagePath: () => {
    return `../../../../../.uploads/`;
  },
  onBeforeUpload: (file) => {
    // Giới hạn định dạng file
    if (/txt/i.test(file.extension)) {
      return true;
    } else {
      return "Vui lòng chọn file có định dạng .txt";
    }
  },
});

if (Meteor.isServer) {
  FilesMachineHistory.denyClient();
  Meteor.publish("FilesMachineHistory.all", function () {
    return FilesMachineHistory.find().cursor;
  });
} else {
  Meteor.subscribe("FilesMachineHistory.all");
}

export default FilesMachineHistory;
