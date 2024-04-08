const { jsPDF } = require('jspdf');
const { nativeImage } = require('electron');
const moment = require('moment');
const fs = require('fs');

const PdfModule = () => {

  const margin = 10;

  const generate = (data, filename) => {
    let { offername, brands } = data;

    if (!offername) offername = "Unknown";
    let result = false;
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imageCellWidth = pageWidth / 2 - 12;
      const middleLineY = 18 + pageHeight / 2 - 14;
      const textRowHeight = (middleLineY - 18 - imageCellWidth) / 3;

      const addImage = (index, imagepath) => {
        let image = nativeImage.createFromPath(imagepath);
        let size = image.getSize();
        const imageBuffer = image.toJPEG(100);
        const base64Image = imageBuffer.toString('base64');

        let imageX = 13, imageY = 19;
        switch (index) {
          case 1:
            imageX = pageWidth / 2 + 3;
            break;
          case 2:
            imageY = middleLineY + 2;
            break;
          case 3:
            imageX = pageWidth / 2 + 3;
            imageY = middleLineY + 2;
            break;
        }
        let imageWidth = imageCellWidth - 4, imageHeight = imageCellWidth - 4;
        if (size.width > size.height) {
          imageHeight = size.height * imageCellWidth / size.width;
          imageY += (imageCellWidth - imageHeight) / 2;
        } else {
          imageWidth = size.width * imageCellWidth / size.height;
          imageX += (imageCellWidth - imageWidth) / 2;
        }
        doc.addImage(base64Image, "JPEG", imageX, imageY, imageWidth, imageHeight);
      };

      const addAlignCenterText = (index, good) => {
        const fontSize = 12;
        doc.setFontSize(fontSize);
        let x = 11 + imageCellWidth / 2;
        let y = 19 + imageCellWidth + 7;
        switch (index) {
          case 0:
            doc.text(good.no, x, y, { align: "center" });
            doc.text(good.symbol, x, y + 15, { align: "center" });
            doc.text(good.price, x, y + 30, { align: "center" });
            break;
          case 1:
            doc.text(good.no, x + imageCellWidth, y, { align: "center" });
            doc.text(good.symbol, x + imageCellWidth, y + 15, { align: "center" });
            doc.text(good.price, x + imageCellWidth, y + 30, { align: "center" });
            break;
          case 2:
            y = middleLineY + imageCellWidth + 7;
            doc.text(good.no, x, y, { align: "center" });
            doc.text(good.symbol, x, y + 15, { align: "center" });
            doc.text(good.price, x, y + 30, { align: "center" });
            break;
          case 3:
            y = middleLineY + imageCellWidth + 7;
            doc.text(good.no, x + imageCellWidth, y, { align: "center" });
            doc.text(good.symbol, x + imageCellWidth, y + 15, { align: "center" });
            doc.text(good.price, x + imageCellWidth, y + 30, { align: "center" });
            break;

        }
      }

      brands.forEach((brandObj, index) => {
        const { brandName, items } = brandObj;
        const nGoods = items.length;
        const nPages = Math.ceil(nGoods / 4);
        const createTime = moment().format("YYYY-MM-DD HH:mm");
        for (let i = 0; i < nPages; i++) {
          doc.setFontSize(8);
          doc.setTextColor("#888");
          doc.text(offername, 10, 8);
          doc.text(createTime, pageWidth - 10, 8, { align: "right" });
          doc.setDrawColor("#888");
          doc.line(10, 9, pageWidth - 10, 9);
          // set brand every page
          doc.setFontSize(18);
          doc.setTextColor("#0000ff");
          doc.text(brandName, pageWidth / 2, 15, { align: 'center' });

          doc.rect(10, 18, pageWidth - 20, pageHeight - 28);
          doc.line(pageWidth / 2, 18, pageWidth / 2, pageHeight - 10);
          doc.line(10, middleLineY, pageWidth - 10, middleLineY);

          doc.line(10, 18 + imageCellWidth, pageWidth - 10, 18 + imageCellWidth);
          doc.line(10, 18 + imageCellWidth + textRowHeight * 1, pageWidth - 10, 18 + imageCellWidth + textRowHeight * 1);
          doc.line(10, 18 + imageCellWidth + textRowHeight * 2, pageWidth - 10, 18 + imageCellWidth + textRowHeight * 2);

          doc.line(10, middleLineY + imageCellWidth, pageWidth - 10, middleLineY + imageCellWidth);
          doc.line(10, middleLineY + imageCellWidth + textRowHeight * 1, pageWidth - 10, middleLineY + imageCellWidth + textRowHeight * 1);
          doc.line(10, middleLineY + imageCellWidth + textRowHeight * 2, pageWidth - 10, middleLineY + imageCellWidth + textRowHeight * 2);

          let goodIndex = i * 4;
          doc.setTextColor("#000");
          if (items[goodIndex]) {
            addImage(0, items[goodIndex]['filenames'][0]);
            addAlignCenterText(0, items[goodIndex]);
            goodIndex++;
          }
          if (items[goodIndex]) {
            addImage(1, items[goodIndex]['filenames'][0]);
            addAlignCenterText(1, items[goodIndex]);
            goodIndex++;
          }
          if (items[goodIndex]) {
            addImage(2, items[goodIndex]['filenames'][0]);
            addAlignCenterText(2, items[goodIndex]);
            goodIndex++;
          }
          if (items[goodIndex]) {
            addImage(3, items[goodIndex]['filenames'][0]);
            addAlignCenterText(3, items[goodIndex]);
            goodIndex++;
          }
          doc.addPage();
        }
      });
      doc.deletePage(doc.getNumberOfPages());
      if (!filename.trim().length) filename = `${offername}_${moment().format("YYYY_MM_DD_hh_mm_ss")}.pdf`;
      doc.save(filename);
      result = true;
    } catch (e) {
      console.log(e);
      result = false;
    }
    return result;
  };

  return {
    generate: generate
  };
};

module.exports = PdfModule();