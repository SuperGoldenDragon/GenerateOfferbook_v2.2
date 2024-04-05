const Item = function(offerId, brandId, filenames, id = "", symbol = "", price = "", no = "") {
	this.offerId = offerId;
	this.brandId = brandId;
	this.filenames = filenames;
	this.symbol = symbol;
	this.price = price;
	this.id = id;
  this.no = no;
	this.init();
};


Item.prototype.init = function() {
  const self = this;
  const brandContainer = $('div[data-brandid="' + self.brandId + '"] .item-blocks-container');
  const brandIndex = $('li[data-brandid="' + self.brandId + '"]').data('brandindex');
  const itemIndex = $('div[data-brandid="' + self.brandId + '"] .item-blocks-container div.item-block').length + 1;
  const offerPrefix = $('#' + self.offerId).data('prefix');
  // let newFileNames = [];

  brandContainer.append('<div class="col-md-3 item-block mt-2" data-itemid="' + self.id + '">\
                          <div class="card p-2">\
                            <div class="form-group mb-2">\
                                <input type="text" class="form-control text-center item-number">\
                            </div>\
                            <div class="item-img"></div>\
                            <div class="form-group mt-2">\
                                <input type="text" class="form-control item-symbol" placeholder="Symbol: ">\
                            </div>\
                            <div class="form-group mt-2">\
                                <input type="text" class="form-control item-price" placeholder="Price: ">\
                            </div>\
                            <div class="d-flex justify-content-end mt-3">\
                                <a href="javascript:" class="me-3" data-bs-toggle="modal" data-bs-target="#edit-current-item">View detail</a>\
                                <a href="javascript:" class="">Delete</a>\
                            </div>\
                          </div>\
                      </div>');

  const newItemBlock = $('[data-itemid="' + self.id + '"]');
  
  $('[data-itemid="' + self.id + '"] .item-img').css('background-image', 'url(' + self.filenames[0].replaceAll("\\", "\/") + ')');
  self.filenames.forEach(function(filename) {
    $('[data-itemid="' + self.id + '"]').append('<div class="hidden-item-filename"></div>');
    $('[data-itemid="' + self.id + '"] .hidden-item-filename:last').data('item-filename', filename);
  });  

  if(self.no == ""){
    $('[data-itemid="' + self.id + '"] input.item-number').val(`${offerPrefix}-${brandIndex}-${itemIndex}`);
  }
  else{
    $('[data-itemid="' + self.id + '"] input.item-number').val(self.no);
  }
  
  $(`[data-itemid="${self.id}"] input.item-symbol`).val(self.symbol);
  $(`[data-itemid="${self.id}"] input.item-price`).val(self.price);

  $(`[data-itemid="${self.id}"] a[data-bs-target="#edit-current-item"]`).on('click', function() {
    let no;
    let symbol;
    let price;

    no = $('[data-itemid="' + self.id + '"] input.item-number').val();
    symbol = $(`[data-itemid="${self.id}"] input.item-symbol`).val();
    price = $(`[data-itemid="${self.id}"] input.item-price`).val();
    $('input[name="goods-edit-number"]').val(no);
    $('input[name="goods-edit-symbol"]').val(symbol);
    $('input[name="goods-edit-price"]').val(price);
    $('input[name="goods-edit-itemId"]').attr("value", self.id);
    $('input[name="goods-edit-itemOfferId"]').attr("value", self.offerId);
    $('input[name="goods-edit-itemBrandId"]').attr("value", self.brandId);

    let itemFileNames = [];
    $('[data-itemid="' + self.id + '"] .hidden-item-filename').each(function() {
        itemFileNames.push($(this).data('item-filename'));
    });

    $('#edit-current-item .hidden-filename').remove();

    itemFileNames.forEach(function(itemFileName) {
      $('#edit-current-item .item-block').append('<div class="hidden-filename"></div>')
      $('#edit-current-item .item-block .hidden-filename:last').data('filename', itemFileName);
    });

    const changeImageContent = $('.load-image-edit-content');
    changeImageContent.empty();


    $('#btn-edit-item').prop('disabled', false);

    ItemRelatives().renderFromImages(itemFileNames, changeImageContent, true);

    $('.load-image-edit-content .goods-image-wrapper').on('click', (e) => {
      ItemRelatives().itemChecking(e);
    });
  });

  newItemBlock.find("input.item-number").on("change", function() {
    const e = new CustomEvent("itemchange", { detail : {offerId : self.offerId, brandId : self.brandId, itemId : self.id} });
    document.dispatchEvent(e);
  });

  newItemBlock.find("input.item-symbol").on("change", function() {
    const e = new CustomEvent("itemchange", { detail : {offerId : self.offerId, brandId : self.brandId, itemId : self.id} });
    document.dispatchEvent(e);
  });

  newItemBlock.find("input.item-price").on("change", function() {
    const e = new CustomEvent("itemchange", { detail : {offerId : self.offerId, brandId : self.brandId, itemId : self.id} });
    document.dispatchEvent(e);
  });
};
