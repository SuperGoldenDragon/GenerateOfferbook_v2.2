const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, WidthType, Media, TableOfContents, File, StyleLevel, HeadingLevel, SectionType, HeightRule, ImageFit, TableRowHeight, VerticalAlign, PageBreak } =  require('docx');
const { nativeImage, dialog } = require('electron');

const DocxModule = () => {
  const defaultImageCellWidth = 4500
  const defaultImageCellHeight = 5800
  const textHeight = 300
 

  const generateDocx = (productInfo, fileName) => {
    let resultProducts = [];
    let showResult = [];
    let doc = null;
    let products = [];
    let allTables = [];
    let tempTables = [];

    productInfo.brands.forEach((brandObj) => {
      const brand = brandObj.brandName;
      
      brandObj.items.forEach((item) => {
        const no =  item.no;
        const symbol = item.symbol;
        const price = item.price;
        if(item.filenames.length > 0)
        {
          item.filenames.forEach((filename) => {
            const imagePath = filename;
            products.push({no, symbol, price, imagePath});
          })
        }
        else{
          const imagePath = item.filenames[0];
          products.push({no, symbol, price, imagePath});
        }
      });
      
      products.forEach((product) => {
        let table = getProductContent(product);
        tempTables.push(table);
      });
      
      allTables.push({brand, tempTables});
      tempTables = [];
      products = [];
      
    });

    allTables.forEach((byBrandObject, index) => {
      const { brand, tempTables } = byBrandObject
      const data = tempTables.reduce((acc, val, i) => {
          if (i % 2 === 0) {
              acc.push([]);
          }
          acc[acc.length - 1].push(val);
          return acc;
      }, []);
      const result = {
          rows: data.map(rowData => (
              new TableRow({
              children: rowData.map(cellData => (
                  new TableCell({
                      children: [cellData],
                  })
              )),
              })
          )),
      };
      showResult = [
          new Paragraph({ 
              alignment: 'center',
              children : [new TextRun({
                  text: brand,
                  size: 40,
              }),]}),
          new Table(result),
      ];
      resultProducts.push(new Paragraph({ text : brand, size : 20}))
      resultProducts.push(new Table(result))

      if(doc == null)
      {
          doc = new Document({
              sections: [{
                  children: showResult
              }]
          })
      }
      else{
          doc.addSection({
              children: showResult
          })
      }
      
    })

    try {
      // Used to export the file into a .docx file
      Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(fileName, buffer);
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }

    // dialog.showMessageBox({
    //     type: 'info',
    //     title: 'Saved file info',
    //     message: fileName + '.docx file has created successfully.',
    // });
    
  }

  const getProductContent = (individualProductInfo) => {
    
    const tempImage = nativeImage.createFromPath(individualProductInfo.imagePath);
    const size = tempImage.getSize();

    const fillWidth = 300;
    const fillHeight = 385;

    const widthRatio = fillWidth / size.width;
    const heightRatio = fillHeight / size.height;

    const realRatio = size.width > size.height ? widthRatio : heightRatio;

    let realImageWidth = realRatio * size.width;
    let realImageHeight = realRatio * size.height;

    if(realImageWidth > fillWidth) realImageWidth = fillWidth;
    if(realImageHeight > fillHeight) realImageHeight = fillHeight;


    let image = new ImageRun({
      data: fs.readFileSync(individualProductInfo.imagePath),
      transformation : {
          width: realImageWidth,
          height:realImageHeight
      }
    });


    let table = new Table({
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    width: {
                    size: defaultImageCellWidth,
                    type: WidthType.DXA
                    },
                    children: [new Paragraph({
                        alignment: 'center',
                        children: [image]})
                    ],
                }),
            ],
            height: {
                value: defaultImageCellHeight,
                rule: 'exact'
            },
        }),
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: defaultImageCellWidth,
                    },
                    children: [new Paragraph({
                        alignment: 'center',
                        text: individualProductInfo.no
                    })],
                }),
            ],
            height: {
                value : textHeight,
                rule: 'exact'
            }
        }),
        new TableRow({
        children: [
            new TableCell({
                width: {
                    size: defaultImageCellWidth,
                },
                children: [new Paragraph({
                    alignment: 'center',
                    text : individualProductInfo.symbol
                })],
            }),
        ],
        height: {
            value : textHeight,
            rule: 'exact'
        }
        }),
        new TableRow({
        children: [
            new TableCell({
                width: {
                    size: 3,
                },
                children: [new Paragraph({
                    alignment: 'center',
                    text : individualProductInfo.price,
                    
                })],
            }),
        ],
        height: {
            value : textHeight,
            rule: 'exact'
        }
        }),
    ],
    }); 



    return table
  } 
  
  return {
    generate : generateDocx
  }
}

module.exports = DocxModule();