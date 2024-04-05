const {dialog} = require('electron');
const fs = require('fs');

const ObsModule = (function() {

  const save = function(filename, data) {
    let result = null;
    try {
      const { id, name } = data;
      const str = JSON.stringify(data);
      fs.writeFileSync(filename, str);
      result = { id, name };
    } catch (e) {
      console.log(e);
    } 
    return result;
  };

  const read = function(filename) {
    let file = null;
    try { 
      file = JSON.parse(fs.readFileSync(filename));
    } catch (e) {
      console.log(e);
    }
    return file;
  }

  return {
    save, read
  };
})();

module.exports = ObsModule;