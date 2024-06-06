const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, WidthType, Media, TableOfContents, File, StyleLevel, HeadingLevel, SectionType, HeightRule, ImageFit, TableRowHeight, VerticalAlign, PageBreak, Bookmark, InternalHyperlink } = require('docx');
const { nativeImage, dialog } = require('electron');

const DocxModule = () => {
    const defaultImageCellWidth = 5200
    const defaultImageCellHeight = 6000
    const textHeight = 420


    const generateDocx = (productInfo, fileName) => {


        let resultProducts = [];
        let showResult = [];
        let doc = null;
        let products = [];
        let allTables = [];
        let tempTables = [];

        const { fontSize } = productInfo;

        const offerName = productInfo.name || fileName;

        productInfo.brands.forEach((brandObj) => {

            const brandId = brandObj.brandId;
            const brand = brandObj.brandName;
            const brandImagePath = brandObj.brandImagePath

            brandObj.items.forEach((item) => {
                const no = item.no;
                const symbol = item.symbol;
                const price = item.price;
                if (item.filenames.length > 0) {
                    item.filenames.forEach((filename) => {
                        const imagePath = filename;
                        products.push({ no, symbol, price, imagePath });
                    })
                }
                else {
                    const imagePath = item.filenames[0];
                    products.push({ no, symbol, price, imagePath });
                }
            });

            products.forEach((product) => {
                let table = getProductContent(product, productInfo.hiddenInputs || [], fontSize);
                tempTables.push(table);
            });

            allTables.push({ brand, tempTables, brandId, brandImagePath });
            tempTables = [];
            products = [];

        });

        doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 720, right: 720, bottom: 720, left: 720
                        }
                    }
                },
                children: [new Paragraph({
                    alignment: "center",
                    children: [new TextRun({
                        text: offerName,
                        size: 48
                    })],
                    spacing: {
                        before: 200,
                        after: 200
                    }
                })].concat(productInfo.brands.map((brand, index) => {
                    const { brandId, brandName } = brand;
                    return new Paragraph({
                        children: [new InternalHyperlink({
                            children: [new TextRun({
                                text: `${index + 1}.   ${brandName} (${brand.items?.length || 0})`,
                                size: 36,
                                color: "#0b57d0",
                            })],
                            anchor: brandId
                        })]
                    })
                }))
            }]
        })

        allTables.forEach((byBrandObject, index) => {
            const { brand, tempTables, brandId, brandImagePath } = byBrandObject
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
            let brandImageWidth = 50, brandImageHeight = 50
            if(brandImagePath) {
                try {
                    const size = brandImageWidth.getSize();
                    brandImageWidth = brandImageHeight * size.width / size.height
                } catch (e) {
                    brandImage = nativeImage.createFromPath(brandImagePath)
                }                
            }
            
            showResult = [
                new Paragraph({
                    alignment: 'center',
                    children: [new Bookmark({
                        id: brandId,
                        children: [new TextRun({
                            text: brand,
                            size: 48,
                            color: "#0000ff"
                        })]
                    })],
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({
                    alignment: 'center',
                    children: [].concat(brandImagePath?[new ImageRun({
                        data : fs.readFileSync(brandImagePath),
                        transformation : {
                            width : brandImageWidth,
                            height: brandImageHeight
                        }
                    })]:[])
                }),
                new Table(result),
            ];
            resultProducts.push(new Paragraph({ text: brand, size: 20, }))
            resultProducts.push(new Table(result))

            if (doc == null) {
                doc = new Document({
                    sections: [{
                        properties: {
                            page: {
                                margin: {
                                    top: 720, right: 720, bottom: 720, left: 720
                                }
                            }
                        },
                        children: showResult
                    }]
                })
            } else {
                doc.addSection({
                    properties: {
                        page: {
                            margin: {
                                top: 720, right: 720, bottom: 720, left: 720
                            }
                        }
                    },
                    children: showResult
                })
            }
        });

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

    }

    const getProductContent = (individualProductInfo, hiddenInputs = [], fontSize = 10) => {

        const tempImage = nativeImage.createFromPath(individualProductInfo.imagePath);
        const size = tempImage.getSize();

        const fillWidth = 340;
        const fillHeight = 400;

        const widthRatio = fillWidth / size.width;
        const heightRatio = fillHeight / size.height;

        const realRatio = size.width > size.height ? widthRatio : heightRatio;

        let realImageWidth = realRatio * size.width;
        let realImageHeight = realRatio * size.height;

        if (realImageWidth > fillWidth) realImageWidth = fillWidth;
        if (realImageHeight > fillHeight) realImageHeight = fillHeight;


        let image = new ImageRun({
            data: fs.readFileSync(individualProductInfo.imagePath),
            transformation: {
                width: realImageWidth,
                height: realImageHeight
            }
        });

        let rows = [new TableRow({
            children: [
                new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    width: {
                        size: defaultImageCellWidth,
                        type: WidthType.DXA
                    },
                    children: [new Paragraph({
                        alignment: 'center',
                        children: [image]
                    })
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
                        children: [new TextRun({ text: individualProductInfo.no, size: fontSize * 2 })]
                    })],
                }),
            ],
            height: {
                value: textHeight,
                rule: 'exact'
            }
        })];

        if (hiddenInputs.indexOf("symbol") < 0) {
            rows.push(new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: defaultImageCellWidth,
                        },
                        children: [new Paragraph({
                            alignment: 'center',
                            children: [new TextRun({ text: individualProductInfo.symbol, size: fontSize * 2 })]
                        })],
                    }),
                ],
                height: {
                    value: textHeight,
                    rule: 'exact'
                }
            }));
        }
        if (hiddenInputs.indexOf("price") < 0) {
            rows.push(new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 3,
                        },
                        children: [new Paragraph({
                            alignment: 'center',
                            children: [new TextRun({ text: individualProductInfo.price, size: fontSize * 2 })]
                        })],
                    }),
                ],
                height: {
                    value: textHeight,
                    rule: 'exact'
                }
            }));
        }
        let table = new Table({
            rows
        });

        return table
    }

    return {
        generate: generateDocx
    }
}

module.exports = DocxModule();