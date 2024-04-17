// global vars

const inputNewOffername = $('#new_offer_name');
const btnCreateOffer = $('#btn_create_offer');
const offersContainer = $('#offer-contents');
const offersHeader = $('#offer-tabs');
const imgContent = $('.load-image-content');
const mainImgContent = $('.load-image-content .load-mainImage-content');
const otherImgContent = $('.load-image-content .load-otherImages-content');
const bntOpenOffer = $('.btn-open-offer');
const btnCloseAllOffer = $('.btn-close-all-offers');
const editBrandName = $('#input_brand_name');
const btnChangeBrandName = $('#btn_change_brandname');

offersContainer.append('<div id="no-offer-alert">\
                          <div class="w3-panel w3-deep-purple">\
                            <h3>No offers.</h3>\
                            <p>No offers are opened and created. Please <a href="javascript:" class="w3-text-blue" data-bs-toggle="modal" data-bs-target="#create-new-offer">create</a> a new offer or <a href="javascript:" class="w3-text-blue btn-open-offer">open</a> exist offers.</p>\
                          </div>\
                        </div>');

const Offerbook = (function () {

  let offers = {};
  let filenames = [];

  const bindBaseEvents = function () {

    editBrandName.on("input", function () {
      var val = $(this).val();
      btnChangeBrandName.prop('disabled', !val.length);
    });

    inputNewOffername.on("input", function () {
      const offername = $(this).val();
      btnCreateOffer.prop("disabled", offername.length ? false : true);
    });

    inputNewOffername.on("keypress", function (e) {
      var keycode = e.keycode || e.charCode;
      if (keycode == 13 && e.target.value) {
        btnCreateOffer.click();
      }
    });

    btnCreateOffer.on("click", function () {
      const offername = inputNewOffername.val();
      if (!offername.length) {
        inputNewOffername.focus();
        return;
      }
      createNewOffer(offername);
      $('#create-new-offer [data-bs-dismiss="modal"]').click();
      inputNewOffername.val("");
    });

    bntOpenOffer.on('click', function () {
      try {
        electron.openOfferDialog();
      } catch (e) {
        console.log("Open offer dialog is failed. It is not electron mode.");
      }
    });

    btnCloseAllOffer.on('click', function () {
      Object.keys(offers).forEach(offerId => {
        if (!offers[offerId].isModified) {
          offers[offerId].close();
        }
      });
    });

    /*Edit Part*/
    $('a.btn-open-offer').on("click", function () {
      $('button.btn-open-offer').click();
    });
    /*Edit Part*/

    $('[data-bs-target="#create-new-offer"]').on("click", function () {
      setTimeout(function () {
        inputNewOffername.focus();
      }, 500);
    });

    $('#btn-load-image').on('click', () => {
      const dialogConfig = {
        title: 'Select image files.',
        buttonLabel: 'Select',
        filters: [{
          name: "Image files", extensions: ["jpg", "jpeg", "png"]
        }],
        properties: ['openFile', 'multiSelections']
      };
      electron.openDialog('showOpenDialogSync', dialogConfig);
    });

    try {
      electron.onFilenames(function (params) {
        const { offerId, brandId, mode, filenames } = params;
        if (mode === "ITEM_IMAGE_MODE") {
          const startIndex = Date.now();
          filenames.forEach(function (filename, index) {
            new Item(offerId, brandId, [filename], `${offerId}_${brandId}_${startIndex + index}`);
          });
        }
        else if (mode === "ITEM_CHANGE_MODE") {
          let modalFileNames = [];
          $('#edit-current-item div.hidden-filename').each(function () {
            modalFileNames.push($(this).data('filename'));
          });

          const changeImageContent = $('#edit-current-item .load-image-edit-content');

          ItemRelatives().renderFromImages(filenames, changeImageContent, false);
          filenames.map((filename, index) => {
            return modalFileNames.push(filename);
          });

          $('.load-image-edit-content .goods-image-wrapper').on('click', (e) => {
            ItemRelatives().itemChecking(e);
          });

          $('#edit-current-item .hidden-filename').remove();

          modalFileNames.forEach(function (modalFileName) {
            $('#edit-current-item .item-block').append('<div class="hidden-filename"></div>')
            $('#edit-current-item .item-block .hidden-filename:last').data('filename', modalFileName);
          });
        }
      });

      electron.saveFileNames(filenames => {
        filenames = filenames;
        if (filenames.length > 0) {
          $('#btn-create-item').prop('disabled', false);
        }

        const newImport = $('#create-new-item .item-block .hidden-create-item').length;

        filenames.forEach(function (filename) {
          $('#create-new-item .item-block').append(`<div class="hidden-create-item" data-create-item="${filename}"></div>`);
        });


        if (newImport == 0) {
          ItemRelatives().renderFromImages(filenames, mainImgContent, true);
        }
        else {
          ItemRelatives().renderFromImages(filenames, otherImgContent, false);
        }


        $('.load-image-content .goods-image-wrapper').on('click', (e) => {
          ItemRelatives().itemChecking(e);
        });

      });

      $('#btn-create-item').on('click', function () {
        const goods_number = $('input[name="goods-number"]').val();
        const goods_symbol = $('input[name="goods-symbol"]').val();
        const goods_price = $('input[name="goods-price"]').val();
        const offerId = $('#current-offer-id').val();
        const brandId = $('#current-brand-id').val();
        const imageCards = $('.load-image-content .load-otherImages-content div[choosed-main-image]');
        let firstIndex;
        imageCards.each(function (index, imageCard) {
          if ($(imageCard).attr('choosed-main-image') == "true") {
            firstIndex = index;
            return;
          }
        });
        let filenames = [];
        $('.item-block .hidden-create-item').each(function () {
          filenames.push($(this).attr('data-create-item'));
        });
        let mainFileName = filenames[firstIndex];
        filenames.splice(firstIndex, 1);
        filenames.unshift(mainFileName);
        const id = `${offerId}_${brandId}_${Date.now()}`;
        new Item(offerId, brandId, filenames, id, goods_symbol, goods_price, goods_number);
        $('#close-create-item-modal').click();
        offers[offerId] && offers[offerId].setModified(true);
      });

      electron.onPdfFileSave(result => {
        if (result) {
          return $.toast({
            heading: 'Success.',
            text: 'Pdf file is saved successfully.',
            icon: 'success',
            position: 'bottom-right',
          });
        }
      });

      electron.onDocFileSave(result => {
        if (result) {
          return $.toast({
            heading: 'Success.',
            text: 'Doc file is saved successfully.',
            icon: 'success',
            position: 'bottom-right',
          });
        }
      });

      electron.onObsSave(function (data, filename) {
        if (!data) {
          return $.toast({
            heading: 'Saving is error.',
            text: 'Offerbook script file saving is failed.',
            icon: 'error',
            position: 'top-right',
          });
        }

        const { id, name } = data;
        if (!id) return;
        if (offers[id]) {
          offersHeader.find('a[href="#' + id + '"]').html(name);
          offers[id].setModified(false);
          offers[id].setFilename(filename);
          return $.toast({
            heading: 'Success.',
            text: 'Offerbook script file is saved successfully.',
            icon: 'success',
            position: 'top-right',
          });
        }
      });

      electron.onObsOpen(function (data, filename) {
        if (!data) {
          return $.toast({
            heading: 'Opening Error',
            text: 'Opening offerbook script file  is failed.',
            icon: 'error',
            position: 'top-right',
          });
        }
        const { id, name, brands, prefix } = data;
        if ($('#' + id).length) {
          return $.toast({
            heading: 'Opening Warning',
            text: 'This offerbook is already opened.',
            icon: 'warning',
            position: 'top-right',
          });
        }
        let openedOffer = new Offer(id, name, false);
        openedOffer.updatePrefix(prefix);
        brands.forEach(function (brand) {
          openedOffer.addBrand(brand);
        });
        openedOffer.setFilename(filename);
        offers[id] = openedOffer;
      });
    } catch (e) {
      console.log("Load opened filenames is failed. web mode");
    }

    $('#btn-change-image').on('click', () => {
      electron.loadImages(null, null, "ITEM_CHANGE_MODE");
    });

    $('#btn-edit-item').on('click', function () {
      const goods_number = $('input[name="goods-edit-number"]').val();
      const goods_symbol = $('input[name="goods-edit-symbol"]').val();
      const goods_price = $('input[name="goods-edit-price"]').val();
      const offerId = $('input[name="goods-edit-itemOfferId"]').attr("value");
      const brandId = $('input[name="goods-edit-itemBrandId"]').attr("value");
      const id = $('input[name="goods-edit-itemId"]').attr("value");

      let modalFileNames = [];
      $('#edit-current-item div.hidden-filename').each(function () {
        modalFileNames.push($(this).data('filename'));
      });
      console.log(modalFileNames);

      const imageCards = $('.load-image-edit-content div[choosed-main-image]');
      let firstIndex;
      imageCards.each(function (index, imageCard) {
        if ($(imageCard).attr('choosed-main-image') == "true") {
          firstIndex = index;
          return;
        }
      });


      let mainFileName = modalFileNames[firstIndex];
      modalFileNames.splice(firstIndex, 1);
      modalFileNames.unshift(mainFileName);

      const item = $(`[data-itemid="${id}"]`);
      item.find('input.item-number').val(goods_number);
      item.find('input.item-symbol').val(goods_symbol);
      item.find('input.item-price').val(goods_price);

      item.find('div.hidden-item-filename').remove();

      modalFileNames.forEach(function (modalFileName) {
        item.append('<div class="hidden-item-filename"></div>');
        item.find('.hidden-item-filename:last').data('item-filename', modalFileName);
      });
      item.find('div.item-img').css('background-image', 'url(' + modalFileNames[0].replaceAll('\\', '\/') + ')');

      $('#close-edit-item-modal').click();
    });

    $(document).on("itemchange", function (e) {
      const { offerId } = e.detail;
      offers[offerId] && offers[offerId].setModified(true);
    });
  };

  /**
   * Create new offer with @offername
   * @param {*} offername 
   * @returns 
   */
  const createNewOffer = function (offername) {
    if (!offername) {
      $('#no-offer-alert').show();
      return;
    }
    // if No offer alert is visible, toggle it
    $('#no-offer-alert').hide();

    const id = Date.now();
    offers[id] = new Offer(id, offername);
  };


  return {
    init: function () {
      bindBaseEvents();
    },
    getOffer: function (id) {
      return offers[id];
    }
  }
}());

$(() => {
  Offerbook.init();
});


/**
 * drag events
 */

const onDragStarter = e => {
  e.dataTransfer.setData('id', $(e.target).parent().parent().data('itemid'));
};

const onDragAllow = (e, targetBlock) => {
  e.preventDefault();
  $(targetBlock).addClass("item-dragover");
};

const onDrop = (e, obj) => {
  e.preventDefault();
  $(obj).removeClass("item-dragover");
  const sourceId = e.dataTransfer.getData("id");
  $(obj).before($('.item-block[data-itemid="' + sourceId + '"]'));
  const arr = sourceId.split("_");
  const brandId = arr[1];
  const brandIndex = $(`li[data-brandid="${brandId}"]`).data('brandindex');
  const offer = Offerbook.getOffer(arr[0]);

  $(`div[data-brandid="${brandId}"] .item-blocks-container .item-block`).each((index, node) => {
    $(node).find('input.item-number').val(`${offer.prefix}-${brandIndex}-${index + 1}`);
  });
};

const onDragLeave = (e, obj) => {
  $(obj).removeClass("item-dragover");
};