const { app, BrowserWindow, Menu, ipcMain, dialog, session } = require('electron')
const url = require('url')
const path = require('path');
const PdfModule = require('./src/modules/pdf.module');
const DocxModule = require('./src/modules/docx.module');
const ObsModule = require('./src/modules/obs.module');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // nodeIntegration: true,
      // contextIsolation: false,
      // enableRemoteModule: true,
      // nodeIntegrationInWorker: true,
    }
  });

  ipcMain.handle('dialog', (event, method, params) => {
    const filenames = dialog[method](win, params) || [];
    event.sender.send("file_names", filenames);
  });

  ipcMain.handle('change_item_image', (event, method, params) => {
    const filename = dialog[method](win, params)[0] || null;
    if (!filename) return;
    event.sender.send('change_item_image_filename', filename);
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  ipcMain.handle('load_images', (e, params) => {
    const config = {
      title: 'Select image files.',
      buttonLabel: 'Select',
      filters: [{
        name: "Image files", extensions: ["jpg", "jpeg", "png"]
      }],
      properties: ['openFile', 'multiSelections']
    };
    const filenames = dialog.showOpenDialogSync(win, config) || [];
    e.sender.send('loaded_filenames', { ...params, filenames });
  });

  ipcMain.handle('save_pdf_dialog', (e, data) => {
    const config = {
      title: 'Select path for save.',
      buttonLabel: 'Save',
      properties: ['saveFile'],
      filters: [{
        name: "PDF file", extensions: ["pdf"]
      }]
    };
    const filename = dialog.showSaveDialogSync(config);
    const pdfResult = PdfModule.generate(data, filename);
    e.sender.send("generated_pdf", pdfResult);
  });

  ipcMain.handle('save_doc_dialog', (e, data) => {
    const config = {
      title: 'Select path for save.',
      buttonLabel: 'Save',
      properties: ['saveFile'],
      filters: [
        { name: "DOC file", extensions: ["docx", "doc"] },
        { name: "All files", extensions: ["*"] }
      ]
    };
    const filename = dialog.showSaveDialogSync(config);
    const docResult = DocxModule.generate(data, filename);
    e.sender.send("generated_doc", docResult);
  });

  ipcMain.handle('save_offer_dialog', (e, data, filename) => {
    if (!filename) {
      const config = {
        title: 'Select path for save.',
        buttonLabel: 'Save',
        properties: ['saveFile'],
        filters: [{
          name: "Obs(Offerbook script) file", extensions: ["obs"]
        }]
      };
      filename = dialog.showSaveDialogSync(config);
    }
    if (!filename) return;
    e.sender.send("generated_obs", ObsModule.save(filename, data), filename);
  });

  ipcMain.handle("open_offer_dialog", (e) => {
    const config = {
      title: 'Select Offerbook script file.',
      buttonLabel: 'Select',
      filters: [{
        name: "Obs file", extensions: ["obs"]
      }],
      properties: ['openFile']
    };
    const filename = dialog.showOpenDialogSync(win, config)[0] || "";
    if (!filename) return;
    e.sender.send("obs_file_content", ObsModule.read(filename), filename);
  });
};

const menutemplate = [
  {
    label: 'Offerbook',
    submenu: [
      {
        label: 'Create'
      },
      {
        label: "Save"
      },
      {
        label: "Save As"
      },
      {
        label: "Expert",
        submenu: [{
          label: "PDF file"
        }]
      }
    ]
  },
  {
    label: "Debug",
    submenu: [{
      role: "toggleDevTools"
    }]
  }
];

const menu = Menu.buildFromTemplate(menutemplate);
Menu.setApplicationMenu(menu);
app.on('ready', createWindow);