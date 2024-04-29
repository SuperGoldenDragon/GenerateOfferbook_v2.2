/*Editing Start*/
var selectedChangeImageItem = null;
try {
  electron.onChangedItemFilename(filename => {
    var ImgPath = filename.replaceAll('\\', '\/');
    var changedImg = $(selectedChangeImageItem).find('.goods-image-wrapper');
    var ChangedImgDivs = $(".load-otherImages-content").children();
    var ChangedItemDatas = $("div[data-create-item]");
    var ChangedData = null;
    var ImgNum = ChangedImgDivs.length;
    for (var i = 0; i < ImgNum; i++) {
      ChangedData = ChangedImgDivs.eq(i).children().eq(0).children().eq(0).attr("data-src");
      if (ImgPath == ChangedData) {
        return $.toast({
          heading: 'Warning',
          text: 'This item is already loaded.',
          icon: 'warning',
          position: 'top-right',
        });
      }
    }
    changedImg.css('background-image', "url(" + ImgPath + ")");
    changedImg.attr('data-src', ImgPath);
    if (selectedChangeImageItem.attr("choosed-main-image") == "true") {
      $('.load-mainImage-content .main-image-border').css('background-image', "url(" + ImgPath + ")");
      $('.load-mainImage-content .main-image-border').attr('data-src', ImgPath);
    }
    for (var i = 0; i < ImgNum; i++) {
      ChangedData = ChangedImgDivs.eq(i).children().eq(0).children().eq(0).attr("data-src");
      ChangedData = ChangedData.replaceAll('\/', '\\');
      ChangedItemDatas.eq(i).attr("data-create-item", ChangedData);
      var EditItemDatas = $("div[data-edit-item]");
      if (EditItemDatas.length > 0) {
        EditItemDatas.eq(i + 1).attr("data-edit-item", ChangedData);
      }
    }
  });
} catch (e) { }
/*Editing End*/


const ItemRelatives = function () {
  /*Editing Start*/
  /*Blocking : Buttons move to middle of images*/
  const itemChecking = function (e) {
    $('.main-image-checked').removeClass('d-block').addClass('d-none');
    $(e.target).siblings('div').removeClass('d-none').addClass('d-block');
    if ($('.btn_div').length > 0) {
      // if ($(e.target).parent().siblings('div').length > 0) {
      if ($(e.target).find('button').length > 0) {
        $('.btn_div').remove();
      } else {
        $('.btn_div').remove();
        // $(e.target).parent().parent().append(`<div class="btn_div d-flex justify-content-between m-1">
        $(e.target).append(`<div class="btn_div d-flex justify-content-between m-1">
                                              <button class="w3-green w3-display-left w3-round-large btn-select-item">Select</button>
                                              <button  class="w3-blue w3-display-right w3-round-large btn-change-item">Change</button>
                                            </div>`);
      }
    } else {
      // $(e.target).parent().parent().append(`<div class="btn_div d-flex justify-content-between m-1">
      $(e.target).append(`<div class="btn_div d-flex justify-content-between m-1">
                                              <button class="w3-green w3-display-left w3-round-large btn-select-item">Select</button>
                                              <button  class="w3-blue w3-display-right w3-round-large btn-change-item">Change</button>
                                            </div>`);
    }
    $('#create-new-item .load-mainImage-content').find('.btn_div').remove();
    $('#edit-current-item .load-mainImage-content').find('.btn_div').remove();

    $('.btn-select-item').off("click");
    $('.btn-select-item').on('click', function () {
      $('div[choosed-main-image]').attr('choosed-main-image', "false");
      // $(this).parent().parent().attr('choosed-main-image', "true");
      // var mainImgSrc = $(this).parent().parent().find('.goods-image-wrapper').css('background-image');
      $(this).parent().parent().parent().parent().attr('choosed-main-image', "true");
      var mainImgSrc = $(this).parent().parent().parent().parent().find('.goods-image-wrapper').css('background-image');
      $('.main-image-border').css('background-image', mainImgSrc);
    });

    $('.btn-change-item').off("click");
    $('.btn-change-item').on("click", function () {
      // selectedChangeImageItem = $(this).parent().parent();
      selectedChangeImageItem = $(this).parent().parent().parent().parent();
      const dialogConfig = {
        title: 'Select image files.',
        buttonLabel: 'Select',
        filters: [{
          name: "Image files",
          extensions: ["jpg", "jpeg", "png"]
        }],
        properties: ['openFile']
      };
      try {
        electron.changeItemImage(dialogConfig);
      } catch (e) { }
    });
  }

  const renderFromImages = function (filenames, imageContent, createMode) {
    filenames.forEach((filename, index) => {
      filename = filename.replaceAll('\\', '\/');
      if (createMode) {
        if (index == 0) {
          imageContent.append(`<div class="my-1">
                              <div class="w3-card">
                                <div class="goods-image-wrapper main-image-border" style="background-image: url('${filename}');" data-src="${filename}"></div>
                              </div>
                            </div>`);
          imageContent.parent().children().eq(1).append(`<div class="w3-third my-1" choosed-main-image="false">
                                                          <div class="w3-card">
                                                            <div class="goods-image-wrapper" style="background-image: url('${filename}');" data-src="${filename}"></div>
                                                            <div class="main-image-checked d-none"></div>
                                                          </div>
                                                        </div>`);
        } else {
          imageContent.parent().children().eq(1).append(`<div class="w3-third my-1" choosed-main-image="false">
                                                          <div class="w3-card">
                                                            <div class="goods-image-wrapper" style="background-image: url('${filename}');" data-src="${filename}"></div>
                                                            <div class="main-image-checked d-none"></div>
                                                          </div>
                                                        </div>`);
        }
      }
      else {
        imageContent.append(`<div class="w3-third my-1" choosed-main-image="false">
                              <div class="w3-card">
                                <div class="goods-image-wrapper" style="background-image: url('${filename}');" data-src="${filename}"></div>
                                <div class="main-image-checked d-none"></div>
                              </div>
                            </div>`);
      }
    });
    /*Editing End*/
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