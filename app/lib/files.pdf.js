import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

const FilesPdf = new FilesCollection({
  debug: true,
  collectionName: "FilesPdf",
  allowClientCode: true,
  storagePath: () => {
    return `../../../../../.uploads/`;
  },
  onBeforeUpload: (file) => {
    // Giới hạn định dạng file
    if (/pdf/i.test(file.extension)) {
      return true;
    } else {
      return "Vui lòng chọn file có định dạng .pdf";
    }
  },
});

if (Meteor.isServer) {
  FilesPdf.denyClient();
  Meteor.publish("FilesPdf.all", function () {
    return FilesPdf.find().cursor;
  });
} else {
  Meteor.subscribe("FilesPdf.all");
}

export default FilesPdf;
