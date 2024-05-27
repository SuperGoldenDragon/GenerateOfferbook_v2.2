const btnSaveOfferSetting = $('#btn_save_offer_setting');
const inputUpdateOfferName = $('#update_offer_name');
const inputUpdatePrefix = $('#prefix_item_number');

const Offer = function (id, offername, isModified = true, hiddenInputs = []) {
  this.id = id || Date.now();
  this.offername = offername;
  this.container = $('#' + id);
  this.prefix = 0;
  this.isModified = isModified;
  this.filename = null;
  this.hiddenInputs = hiddenInputs;
  this.init();
}

Offer.prototype.init = function () {
  const self = this;
  $('#no-offer-alert').hide();
  offersHeader.append('<li class="nav-item">\
                              <a class="nav-link" data-bs-toggle="tab" href="#' + self.id + '" data-offername="' + self.offername + '" data-offerid="' + self.id + '">' + self.offername + (self.isModified ? " *" : "") + '</a>\
                            </li>');
  offersContainer.append('<div class="tab-pane container-fluid px-0 py-2" id="' + self.id + '" role="tabpanel" data-prefix="' + self.prefix + '">\
                              <div class="offer-actions-bar mt-2 mb-3 p-3 d-flex border rounded">\
                                <a href="javascript:" class="me-4 btn_save_offer"><i class="fa fa-save"></i> Save this offer</a>\
                                <a href="javascript:" class="me-4 btn_gen_doc"><i class="fa fa-file-word-o"></i> Generate docx</a>\
                                <a href="javascript:" class="me-4 btn_gen_pdf"><i class="fa fa-file-pdf-o"></i> Generate pdf</a>\
                                <a href="javascript:" class="me-auto btn_gen_secure"><i class="fa fa-file-zip-o"></i> Generate secure file</a>\
                                <a href="javascript:" class="me-4"  data-bs-toggle="modal" data-bs-target="#setting-offer"><i class="fa fa-cog"></i> Setting</a>\
                                <a href="javascript:" class="btn_offer_close">Close</a>\
                              </div>\
                            <div class="row">\
                              <div class="col-md-3">\
                                <div class="w3-card w3-indigo w3-round-large px-2 py-2">\
                                  <div class="d-grid mb-2">\
                                    <div class="form-group mb-2">\
                                      <input type="text" class="form-control new-brand-name" placeholder="New brand name">\
                                    </div>\
                                    <button class="w3-btn w3-ripple w3-blue w3-round-large btn-block btn-create-new-brand">Create new brand</button>\
                                  </div> \
                                  <h3 class="text-center w3-border-bottom pb-2 mt-2">List of brands</h3>\
                                  <div>\
                                    <ul class="list-group list-group-flush bg-transparent brands-container">\
                                    </ul>\
                                  </div> \
                                </div>\
                                <div class="d-flex justify-content-center my-2 ">\
                                  <a href="javascript:" class="btn-delete-all-brands">Delete all brands</a>\
                                </div>\
                              </div>\
                              <div class="col-md-9 items-container">\
                                <div class="w3-panel w3-dark-gray my-0 no-brand-alert">\
                                  <h3>No brands.</h3>\
                                  <p>Please create a new brand.</p>\
                                </div>\
                              </div>\
                          </div>\
                        </div>');

  // set this tab to active
  offersHeader.find('.nav-link').removeClass("active");
  offersContainer.find('.tab-pane').removeClass("active");
  $('[href="#' + self.id + '"]').addClass("active");
  $('#' + self.id).addClass("active");

  const activateOffer = () => {
    $('[name="check_hidden_input"]').prop('checked', false);
    $(`#${self.id} .item-block input`).prop('hidden', false);
    // hide create and edit item dialog
    $('#edit-current-item input[name]').prop('hidden', false);
    $('#create-new-item input[name]').prop('hidden', false);

    self.hiddenInputs.forEach((key) => {
      // hide inputs of item block
      $(`#${self.id} input.item-${key}`).prop('hidden', true);
      // hide create and edit item dialog
      $(`[name="goods-${key}"]`).prop('hidden', true);
      $(`[name="goods-edit-${key}"]`).prop('hidden', true);

      $('[name="check_hidden_input"][value="' + key + '"]').prop('checked', true);
    });
  }

  // when this offer is activated
  $('[href="#' + self.id + '"]').on("click", () => {
    activateOffer();
  });

  activateOffer();


  // update container  
  self.container = $('#' + self.id);

  // bind events new components
  const newContainer = $('#' + self.id);
  const inputNewBrandName = newContainer.find('.new-brand-name');
  const btnCreateNewBrand = newContainer.find('.btn-create-new-brand');
  const btnDeleteAllBrands = newContainer.find('.btn-delete-all-brands');

  btnDeleteAllBrands.on("click", function () {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete all brands and goods?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    }).then((result) => {
      if (result.isConfirmed) {
        offersContainer.find('div.items-container div[data-brandid]').remove();
        offersContainer.find('div.items-container div.no-brand-alert').show();
        offersContainer.find('div ul li').remove();
      }
    });
  });

  inputNewBrandName.on('input', function () {
    const value = $(this).val();
    btnCreateNewBrand.prop('disabled', value.length ? false : true);
  });

  inputNewBrandName.on("keypress", function (e) {
    var keyCode = e.charCode || e.keyCode;
    if (keyCode == 13 && $(this).val()) btnCreateNewBrand.click();
  });

  btnCreateNewBrand.on("click", function () {
    const brandName = inputNewBrandName.val();
    if (!brandName.length) return;
    new Brand(self.id, brandName);
    inputNewBrandName.val("");
    self.setModified(true);
  });

  newContainer.find('[data-bs-target="#setting-offer"]').on("click", function () {
    inputUpdateOfferName.val(self.offername);
    inputUpdatePrefix.val(self.prefix);
    // uncheck all checkbox for hidden inputs
    $('[name="check_hidden_input"]').prop("checked", false);
    self.hiddenInputs.forEach(key => {
      $('[name="check_hidden_input"][value="' + key + '"]').prop("checked", true);
    });
    btnSaveOfferSetting.off("click");
    btnSaveOfferSetting.on("click", function () {
      const newOffername = inputUpdateOfferName.val();
      const newPrefix = inputUpdatePrefix.val();
      if (!newOffername.length || !newPrefix.length) {
        $.toast({
          heading: 'Invalid input',
          text: 'Input correct values.',
          icon: 'warning',
          position: 'bottom-right',
        });
        return;
      }
      $('a.nav-link[href="#' + self.id + '"]').html(`${newOffername} *`);
      $('#' + self.id).data('prefix', newPrefix);
      self.prefix = newPrefix;
      $('#setting-offer button[data-bs-dismiss]').click();
      // update number of items
      self.updateNumbers();
      self.setModified(true);
      self.hiddenInputs = [];
      $('[name="check_hidden_input"]').each((index, obj) => {
        const key = $(obj).val();
        if ($(obj).prop('checked')) {
          self.hiddenInputs.push(key);
        }
        // hide inputs of item block
        $(`#${self.id} input.item-${key}`).prop('hidden', $(obj).prop('checked'));
        // hide create and edit item dialog
        $(`[name="goods-${key}"]`).prop('hidden', $(obj).prop('checked'));
        $(`[name="goods-edit-${key}"]`).prop('hidden', $(obj).prop('checked'));
      });
    });
  });

  newContainer.find('a.btn_gen_pdf').on("click", function () {
    if (!newContainer.find('.item-block').length) {
      return $.toast({
        heading: 'No items to generate pdf',
        text: 'Please create brands and items.',
        icon: 'warning',
        position: 'bottom-right',
      });
    }
    // save dialog
    try {
      electron.savePdfDialog(self.getOfferData());
    } catch (e) {
      console.log("Opening save pdf dialog is failed. This is web mode.");
    }
  });

  newContainer.find('a.btn_gen_doc').on('click', function () {
    if (!newContainer.find('.item-block').length) {
      return $.toast({
        heading: 'No items to generate doc',
        text: 'Please create brands and items.',
        icon: 'warning',
        position: 'bottom-right'
      });
    }
    // save dialog
    try {
      electron.saveDocDialog(self.getOfferData());
    } catch (e) {
      console.log("Opening save dialog is failed. This is web mode.");
    }
  });

  newContainer.find('a.btn_save_offer').on("click", function (e) {
    try {
      electron.saveOfferDialog(self.getOfferData(), self.filename);
    } catch (e) {
      console.log("Opening save offer dialog is failed. This is web mode.");
    }
  });

  newContainer.find('a.btn_offer_close').on("click", function () {
    if (self.isModified) {
      Swal.fire({
        title: 'Are you sure?',
        text: "This offerbook is modified. Do you want close this offerbook? The changes will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!'
      }).then((result) => {
        if (result.isConfirmed) {
          self.close();
        }
      });
    } else {
      self.close();
    }
  });
};

Offer.prototype.loadedItemImages = function (brandId, filenames) {
  const self = this;
  const startIndex = Date.now();
  filenames.map(function (filename, index) {
    return new Item(self.id, brandId, [filename], `${self.id}_${brandId}_${startIndex + index}`);
  });
  self.setModified(true);
};

Offer.prototype.updateNumbers = function () {
  const self = this;
  self.container.find('div[data-brandid]').each(function (index) {
    const brandId = $(this).data('brandid');
    index++;
    $('li[data-brandid="' + brandId + '"]').data('brandindex', index);
    $(this).find('.item-block[data-itemid]').each(function (itemIndex) {
      itemIndex++;
      $(this).find('input.item-number').val(`${self.prefix}-${index}-${itemIndex}`);
    });
  });
  self.setModified(true);
};

Offer.prototype.getOfferData = function () {
  const self = this;
  let offerData = {
    id: self.id,
    name: self.offername,
    prefix: self.prefix,
    brands: [],
    hiddenInputs: self.hiddenInputs
  };
  let brand = {};
  self.container.find('li[data-brandid]').each(function () {
    brand = {
      brandId: $(this).data('brandid'),
      brandName: $(this).data('brandname'),
      brandIndex: $(this).data('brandindex'),
      items: []
    };

    $('div[data-brandid="' + brand.brandId + '"] .item-block').each(function () {
      const itemId = $(this).data('itemid');
      const no = $(this).find('input.item-number').val();
      const symbol = $(this).find('input.item-symbol').val();
      const price = $(this).find('input.item-price').val();
      let filenames = [];
      $(this).find('div.hidden-item-filename').each(function () {
        filenames.push($(this).data('item-filename'));
      });
      brand.items.push({ itemId, no, symbol, price, filenames });
    });
    offerData.brands.push(brand);
  });
  return offerData;
};

Offer.prototype.updatePrefix = function (newPrefix) {
  this.prefix = newPrefix;
};

Offer.prototype.addBrand = function (brand) {
  const self = this;
  const { brandId, brandIndex, brandName, items } = brand;
  new Brand(this.id, brandName, brandId);
  items.forEach(function (item) {
    new Item(self.id, brandId, item.filenames, item.itemId, item.symbol, item.price, item.no);
  });
};

Offer.prototype.setFilename = function (filename) {
  this.filename = filename;
};

Offer.prototype.close = function () {
  const self = this;
  $('a[href="#' + self.id + '"]').parent().remove();
  $('#' + self.id).remove();
  if ($('a[data-offername]').length) {
    $('a[data-offername]:first').addClass("active");
    const activeOfferId = $('a[data-offername].active').data("offerid");
    $('#' + activeOfferId).addClass("active");
  } else {
    $('#no-offer-alert').show();
  }
};

Offer.prototype.setModified = function (isModified) {
  this.isModified = isModified;
  $('a[data-offerid="' + this.id + '"]').html(this.offername + (isModified ? " *" : ""));
};