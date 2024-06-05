const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDialog: (method, config) => {
    const result = ipcRenderer.invoke('dialog', method, config);
    return result;
  },
  saveFileNames: (callback) => {
    ipcRenderer.on("file_names", (event, data) => {
      callback(data);
    })
  },
  loadImages: (offerId, brandId, mode) => {
    ipcRenderer.invoke('load_images', { offerId, brandId, mode });
  },
  onFilenames: (callback) => {
    ipcRenderer.on('loaded_filenames', (e, params) => {
      callback(params);
    });
  },
  // open savefiledialog
  savePdfDialog: (data) => {
    ipcRenderer.invoke('save_pdf_dialog', data);
  },
  // open savedocfiledialog
  saveDocDialog: (data) => {
    ipcRenderer.invoke('save_doc_dialog', data);
  },
  onPdfFileSave: (callback) => {
    ipcRenderer.on("generated_pdf", (event, data) => {
      callback(data);
    });
  },
  onDocFileSave: (callback) => {
    ipcRenderer.on("generated_doc", (event, data) => {
      callback(data);
    });
  },
  saveOfferDialog: (data, filename) => {
    ipcRenderer.invoke("save_offer_dialog", data, filename);
  },
  onObsSave: (callback) => {
    ipcRenderer.on("generated_obs", (event, data, filename) => {
      callback(data, filename);
    });
  },
  openOfferDialog: () => {
    ipcRenderer.invoke("open_offer_dialog");
  },
  onObsOpen: callback => {
    ipcRenderer.on("obs_file_content", (e, data, filename) => {
      callback(data, filename);
    });
  },
  changeItemImage: config => {
    ipcRenderer.invoke('change_item_image', 'showOpenDialogSync', config);
  },
  onChangedItemFilename: (callback) => {
    ipcRenderer.on("change_item_image_filename", (e, filename) => {
      callback(filename);
    });
  },
  loadBrandImage: (offerId, brandId) => {
    ipcRenderer.invoke("open_brand_image", { offerId, brandId })
  },
  onLoadBrandImage: (callback) => {
    ipcRenderer.on('selected_brandimage', (e, args) => {
      callback(args)
    })
  }
});