var service = angular.module('starter');

service.factory('FileService', function() {
    var images;
    var IMAGE_STORAGE_KEY = 'images';

    function getImages() {
      var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
      if (img) {
        images = JSON.parse(img);
      } else {
        images = [];
      }
      console.log( "get imgs: " + JSON.stringify(images) );
      return images;
    };

    function addImage(img) {
      images.push(img);
      console.log( "add img: " + img );
      window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    };

    return {
      storeImage: addImage,
      images: getImages
    }
  });

service.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    function optionsForType(type) {
      var source;
      switch (type) {
        case 0:
          source = Camera.PictureSourceType.CAMERA;
          break;
        case 1:
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }
      return {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: source,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
    }

  function saveMedia(type) {
      return $q(function(resolve, reject) {
        var options = optionsForType(type);


        $cordovaCamera.getPicture(options).then(function(imageUrl) {
          var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
          var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
          var newName = makeid() + name

          // console.log( "imageUrl: " + imageUrl );
          // console.log( "name: " + name );
          // console.log( "namePath: " + namePath );
          // console.log( "newName: " + newName );

          // var namePath = "content://com.android.providers.media.documents/document/";
          window.FilePath.resolveNativePath(imageUrl, successNative, failNative);

          function failNative(e) {
            console.log( "error: " + JSON.stringify(e) );
            // console.error('Houston, we have a big problem :(');
          }

          function successNative(finalPath) {
            // console.log( "finalPath: " + finalPath );

            var name = finalPath.substr(finalPath.lastIndexOf('/') + 1);
            var namePath = finalPath.substr(0, finalPath.lastIndexOf('/') + 1);
            var newName = makeid() + name

            // namePath = "file:///storage/emulated/0/DCIM/Camera/";

            console.log( "finalPath: " + finalPath );
            console.log( "name: " + name );
            console.log( "namePath: " + namePath );
            console.log( "newName: " + newName );

            // var cordovaDir = "file:///storage/emulated/0/Android/data/com.ionicframework.devdacticimages636728/files/";
            // console.log( "cordova.file.dataDirectory: " + cordovaDir );

            // file:///storage/emulated/0/DCIM/Camera/IMG_20160529_183537.jpg
            // file:///data/data/com.ionicframework.devdacticimages636728/files/OsBXpIMG_20160529_183546.jpg

            // $cordovaFile.copyFile(namePath, name, cordovaDir, newName)
            $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
              .then(function(info) {
                // console.log( "file info: " + JSON.stringify(info) );
                FileService.storeImage(newName);
                resolve();
              }, function(e) {
                console.log( "file info error: " + JSON.stringify(e) );
                reject();
              });
          }
        });

      })
    }
    return {
      handleMediaDialog: saveMedia
    }
  });
