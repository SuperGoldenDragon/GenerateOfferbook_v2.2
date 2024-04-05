const ItemRelatives = function() {
  const itemChecking = function(e) {
    $('.main-image-checked').removeClass('d-block').addClass('d-none');
    $('.goods-image-wrapper').removeClass('main-image-border');
    $(e.target).siblings('div').removeClass('d-none').addClass('d-block');
    $(e.target).parent().addClass('main-image-border');
    $('.w3-third[choosed-main-image]').attr('choosed-main-image', "false");
    $(e.target).parent().parent().parent().attr('choosed-main-image', "true");

  }

  const renderFromImages = function(filenames, imageContent, createMode) {
    filenames.forEach((filename, index) => {
      filename = filename.replaceAll('\\', '\/');
      if(createMode)
      {
        if(index == 0){
          imageContent.append(`<div class="w3-third my-1" choosed-main-image="true">
                              <div class="w3-card">
                                <div class="goods-image-wrapper main-image-border">
                                  <img src="${filename}" class="goods-image">
                                  <div class="main-image-checked d-block">
                                    <i class="fa fa-check"></i>
                                  </div>
                                </div>
                              </div>
                            </div>`);
        }else{
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
      }
      else{
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
    itemChecking : function(e) {
      itemChecking(e);
    },
    renderFromImages : function(filenames, imageContent, createMode) {
      renderFromImages(filenames, imageContent, createMode);
    }
  }
}