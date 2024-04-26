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

    /*Editing Start*/
    $('a.btn-open-offer').on("click", function () {
      $('button.btn-open-offer').click();
    });
    /*Editing End*/

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
        } else if (mode === "ITEM_CHANGE_MODE") {
          let modalFileNames = [];
          $('#edit-current-item div.hidden-edit-item').each(function () {
            modalFileNames.push($(this).attr('data-edit-item'));
          });

          const changeImageContent = $('#edit-current-item div.load-image-edit-content div.load-otherImages-content');
          /*Editing Start*/
          const newImport = $('#edit-current-item .item-block .hidden-edit-item').length;
          if (newImport == 0) {
            filenames.length = 3;
            ItemRelatives().renderFromImages(filenames, changeImageContent, false);
          } else if (newImport < 3) {
            filenames.length = 3 - newImport;
            ItemRelatives().renderFromImages(filenames, changeImageContent, false);
          }
          /*Editing End*/

          filenames.map((filename, index) => {
            return modalFileNames.push(filename);
          });

          $('.load-image-edit-content .goods-image-wrapper').on('click', (e) => {
            ItemRelatives().itemChecking(e);
          });

          $('#edit-current-item .hidden-edit-item').remove();

          modalFileNames.forEach(function (modalFileName) {
            $('#edit-current-item .item-block').append('<div class="hidden-edit-item"></div>');
            $('#edit-current-item .item-block .hidden-edit-item:last').attr('data-edit-item', modalFileName);
          });
        }
      });

      electron.saveFileNames(filenames => {
        filenames = filenames;
        if (filenames.length > 0) {
          $('#btn-create-item').prop('disabled', false);
        }
        /*Editing Start*/
        filenames.length = 3;
        const newImport = $('#create-new-item .item-block .hidden-create-item').length;
        filenames.forEach(function (filename) {
          $('#create-new-item .item-block').append(`<div class="hidden-create-item" data-create-item="${filename}"></div>`);
        });

        if (newImport == 0) {
          ItemRelatives().renderFromImages(filenames, mainImgContent, true);
        } else if (newImport < 3) {
          filenames.length = 3 - newImport;
          ItemRelatives().renderFromImages(filenames, otherImgContent, false);
        }
        /*Editing End*/

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
        let firstIndex = 0;
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

    /*Editing Start*/
    $('#btn-edit-item').on('click', function () {
      const goods_number = $('input[name="goods-edit-number"]').val();
      const goods_symbol = $('input[name="goods-edit-symbol"]').val();
      const goods_price = $('input[name="goods-edit-price"]').val();
      const id = $('input[name="goods-edit-itemId"]').attr("value");
      var SelectedImages = $('#edit-current-item').find('div[choosed-main-image]');
      var Imglength = SelectedImages.length;
      var changedImgSrc = $('#edit-current-item  .load-mainImage-content .main-image-border').attr('data-src');
      const item = $(`[data-itemid="${id}"]`);
      item.find('input.item-number').val(goods_number);
      item.find('input.item-symbol').val(goods_symbol);
      item.find('input.item-price').val(goods_price);
      for (var i = 0; i < Imglength; i++) {
        if ($(SelectedImages[i]).attr('choosed-main-image') == "true") {
          changedImgSrc = $(SelectedImages[i]).find('div.goods-image-wrapper').attr('data-src');
        }
      }
      item.find('div.item-img').css('background-image', 'url(' + changedImgSrc + ')');
      var hiddenFileName = changedImgSrc.replaceAll('\/', '\\');
      $('[data-itemid="' + id + '"] .hidden-item-filename').data('item-filename', hiddenFileName);
      $('#close-edit-item-modal').click();
    });

    $('#close-edit-item-modal').on('click', function () {
      $('#edit-current-item').find('div.hidden-edit-item').remove();
    });
    /*Editing End*/

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