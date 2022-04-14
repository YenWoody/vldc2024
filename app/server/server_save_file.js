import {fs} from 'fs';
import {Meteor} from 'meteor/meteor';
import { check } from 'meteor/check';
if (Meteor.isClient) {
  Meteor.methods({
    'saveFile': function(blob, name, path, encoding) {
      check(blob, Match.Any);
      check(name, String);
      check(path, String);
      check(encoding, String);
      var path = cleanPath(path),
        name = cleanName(name || 'file'), encoding = encoding || 'binary',
        chroot = Meteor.chroot || '../../../../public';
        path = chroot + (path ? '/' + path + '/' : '/');
      
      // TODO Add file existance checks, etc...
      fs.writeFile(path + name, blob, encoding, function(err) {
        if (err) {
          throw (new Meteor.Error(500, 'Failed to save file.', err));
        } else {
          console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
        }
      }); 

      function cleanPath(str) {
        if (str) {
          return str.replace(/\.\./g,'').replace(/\/+/g,'').
            replace(/^\/+/,'').replace(/\/+$/,'');
        }
      }
      function cleanName(str) {
        return str.replace(/\.\./g,'').replace(/\//g,'');
      }
    },
  
  });
}
