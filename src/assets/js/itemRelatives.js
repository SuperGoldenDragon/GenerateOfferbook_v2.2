const ItemRelatives = function () {
  const itemChecking = function (e) {
    var mainImgSrc;
    $('.main-image-checked').removeClass('d-block').addClass('d-none');
    $(e.target).siblings('div').removeClass('d-none').addClass('d-block');
    mainImgSrc = $(e.target).attr('src');
    $('.main-image-border').children().eq(0).attr('src', mainImgSrc);
  }

  const renderFromImages = function (filenames, imageContent, createMode) {
    filenames.forEach((filename, index) => {
      filename = filename.replaceAll('\\', '\/');
      if (createMode) {
        if (index == 0) {
          imageContent.append(`<div class="my-1" choosed-main-image="true">
                              <div class="w3-card">
                                <div class="goods-image-wrapper main-image-border">
                                  <img src="${filename}" class="goods-image">
                                </div>
                              </div>
                            </div>`);
          imageContent.parent().children().eq(1).append(`<div class="w3-third my-1" choosed-main-image="false">
          
                                                          <div class="w3-card">
                                                            <div class="goods-image-wrapper mx-1">
                                                              <img src="${filename}" class="goods-image">
                                                              <div class="main-image-checked d-none">
                                                                <i class="fa fa-check"></i>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>`);
        } else {
          imageContent.parent().children().eq(1).append(`<div class="w3-third my-1" choosed-main-image="false">
                                                          <div class="w3-card">
                                                            <div class="goods-image-wrapper mx-1">
                                                              <img src="${filename}" class="goods-image">
                                                              <div class="main-image-checked d-none">
                                                                <i class="fa fa-check"></i>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>`);
        }
      }
      else {
        imageContent.append(`<div class="w3-third my-1" choosed-main-image="false">
                              <div class="w3-card">
                                <div class="goods-image-wrapper">
                                  <img src="${filename}" class="goods-image">
                                  <div class="main-image-checked d-none">
                                    <i class="fa fa-check"></i>
                                  </div>
                                </div>
                              </div>
                            </div>`);
      }
    });
  }

  return {
    itemChecking: function (e) {
      itemChecking(e);
    },
    renderFromImages: function (filenames, imageContent, createMode) {
      renderFromImages(filenames, imageContent, createMode);
    }
  }
}