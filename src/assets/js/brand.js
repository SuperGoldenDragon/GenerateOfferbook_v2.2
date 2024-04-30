
const Brand = function (offerId, brandName, brandId) {
  this.id = brandId || Date.now();
  this.offerId = offerId;
  this.brandName = brandName;
  this.offerContainer = $('#' + offerId);
  this.init();
};

Brand.prototype.init = function () {
  const self = this;
  if (self.offerContainer.find('[data-brandname="' + self.brandName + '"]').length) {
    $.toast({
      heading: 'Error',
      text: 'This brand is already exist.',
      icon: 'error',
      position: 'bottom-right',
    });
    return false;
  }
  const brandIndex = self.offerContainer.find('.brands-container li').length + 1;
  self.offerContainer.find('.no-brand-alert').hide();
  self.offerContainer.find('.brands-container').append('<li class="list-group-item" data-brandname="' + self.brandName + '" data-brandid="' + self.id + '" data-brandindex="' + brandIndex + '">\
                                                    <a href="javascript:" class="d-block">' + self.brandName + '</a>\
                                                  </li>');
  self.offerContainer.find('.items-container').append('<div class="mb-4" data-brandid="' + self.id + '">\
                                                        <div class="d-flex justify-content-between mb-3">\
                                                          <div>\
                                                            <span class="h1 me-4">' + self.brandName + '</span>\
                                                            <a href="javascript:" class="me-2 btn-import-item-images">Import new images</a>\
                                                            <a href="javascript:" class="me-2 delete-all-item">Delete all items</a>\
                                                            <a href="javascript:" class="me-2 delete-this-brand">Delete this brand</a>\
                                                            <a href="javascript:" class="me-2 " data-bs-toggle="modal" data-bs-target="#change-brand-name">Change brand name</a>\
                                                          </div>\
                                                          <div>\
                                                            <button class="w3-btn w3-ripple w3-teal w3-round-large btn-create-item" data-bs-toggle="modal" data-bs-target="#create-new-item">Create new item</button>\
                                                          </div>\
                                                        </div>\
                                                        <div class="container-fluid">\
                                                          <div class="item-blocks-container row">\
                                                          </div>\
                                                        </div>\
                                                      </div>');

  self.offerContainer.find('.items-container div[data-brandid="' + self.id + '"]').hide();

  self.offerContainer.find('li[data-brandid="' + self.id + '"] a').on("click", function () {
    self.offerContainer.find('.items-container div[data-brandid]').hide();
    self.offerContainer.find('.items-container div[data-brandid="' + self.id + '"]').show();
  });

  self.offerContainer.find('button[data-bs-target="#create-new-item"]').on('click', function () {
    $('#btn-create-item').prop('disabled', true);
    $('div.load-mainImage-content').empty();
    $('div.load-otherImages-content').empty();
    $('div.hidden-create-item').remove();
    $('div.hidden-edit-item').remove();
    $('input[name="goods-number"]').val("");
    $('input[name="goods-symbol"]').val("");
    $('input[name="goods-price"]').val("");
    $('#current-brand-id').val(self.id);
    $('#current-offer-id').val(self.offerId);
  });

  if (self.offerContainer.find('li[data-brandname]').length == 1) {
    self.offerContainer.find('li[data-brandid="' + self.id + '"] a').click();
  }

  $('div[data-brandid="' + self.id + '"] a.btn-import-item-images').on("click", function () {
    try {
      electron.loadImages(self.offerId, self.id, "ITEM_IMAGE_MODE");
    } catch (e) {
      console.log("Load item images is failed. It is web mode.");
    }
  });

  $('div[data-brandid="' + self.id + '"] a.delete-all-item').on("click", function () {
    const ThisBrand = $(this).parent().parent().parent();
    const Items = ThisBrand.children().eq(1).children().eq(0).children();
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete all items?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    }).then((result) => {
      if (result.isConfirmed) {
        Items.remove();
      }
    });
  });

  $('div[data-brandid="' + self.id + '"] a.delete-this-brand').on("click", function () {
    const ThisBrand = $(this).parent().parent().parent();
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this brand?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete this!'
    }).then((result) => {
      if (result.isConfirmed) {
        const brandID = ThisBrand.data("brandid");
        ThisBrand.remove();
        $('li[data-brandid="' + brandID + '"]').remove();
        var li_num = $('li[data-brandid]').length;
        if (li_num == 0) {
          self.offerContainer.find('.no-brand-alert').show();
        }
      }
    });
  });

  $('div[data-brandid="' + self.id + '"] a[data-bs-target="#change-brand-name"]').on("click", function () {
    setTimeout(function () {
      editBrandName.val(self.brandName);
      editBrandName.focus();
    }, 500);

    btnChangeBrandName.off('click');
    btnChangeBrandName.on("click", function () {
      const updatedBrandName = editBrandName.val();
      if (!updatedBrandName.length) return;
      self.updateBrandName(updatedBrandName);
      $('#change-brand-name button[data-bs-dismiss="modal"]').click();
    });
  });
};

Brand.prototype.addNewItems = function (items) { };

Brand.prototype.updateBrandName = function (newName) {
  this.brandName = newName;
  $('li[data-brandid="' + this.id + '"] a').html(newName);
  $('div[data-brandid="' + this.id + '"] div div span').html(newName);
};