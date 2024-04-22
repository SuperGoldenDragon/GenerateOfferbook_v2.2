const ItemRelatives = function () {

  /*Edit Part*/
  const itemChecking = function (e) {
    $('.main-image-checked').removeClass('d-block').addClass('d-none');
    $(e.target).siblings('div').removeClass('d-none').addClass('d-block');
    $('div[choosed-main-image]').attr('choosed-main-image', "false");
    $(e.target).parent().parent().parent().attr('choosed-main-image', "true");

    $('.btn_div').remove();
    $(e.target).parent().parent().append(`<div class="btn_div d-flex justify-content-between m-1">
                                                    <button class="w3-green w3-round-large btn-select-item">Select</button>
                                                    <button  class="w3-blue w3-round-large btn-change-item">Change</button>
                                                  </div>`);
    $('.load-mainImage-content').children().eq(0).children().eq(0).children().eq(1).remove();

    $('.btn-select-item').on('click', function () {
      mainImgSrc = $(this).parent().parent().find('img').attr('src');
      $('.main-image-border').children().eq(0).attr('src', mainImgSrc);
    });

    // $('.btn-change-item').on("click", function () {
    //   var changedImg = $(this).parent().parent().find('img');
    //   var removeImgSrc = changedImg.attr('src');
    //   removeImgSrc = removeImgSrc.replaceAll('\/', '\\');
    //   console.log("removeImgSrc = " + removeImgSrc);
    //   const dialogConfig = {
    //     title: 'Select image files.',
    //     buttonLabel: 'Select',
    //     filters: [{
    //       name: "Image files", extensions: ["jpg", "jpeg", "png"]
    //     }],
    //     properties: ['openFile']
    //   };
    //   var num = $('#create-new-item').find('div[data-create-item]').length;
    //   console.log(num);
    //   if (num > 3) {
    //     $('#create-new-item').find('div[data-create-item="' + removeImgSrc + '"]').remove();
    //     var changedImgSrc;
    //     changedImgSrc = $('.item-block .hidden-create-item:last').data('create-item');
    //     changedImgSrc = changedImgSrc.replaceAll('\\', '\/');
    //     console.log('changedImgSrc = ' + changedImgSrc);
    //     changedImg.attr('src', changedImgSrc);
    //   }
    //   electron.openDialog('showOpenDialogSync', dialogConfig);
    // });
  }
  /*Edit Part*/

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