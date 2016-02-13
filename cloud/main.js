Parse.Cloud.define("getFbPic", function (request, response) {
  console.log(request);
  Parse.Cloud.useMasterKey();
  var user = Parse.User.current();
  var pictureUrl = request.params.pictureUrl;

  return Parse.Cloud.httpRequest({
    url: pictureUrl,
    followRedirects: true,
    method: "GET",
    success: function (httpResponse) {
      console.log(httpResponse);
      var parseFile = new Parse.File("profile.jpg", {base64: httpResponse.buffer.toString('base64', 0, httpResponse.buffer.length)})
      parseFile.save({
       success:function() {
          user.set({'photo': parseFile});
          user.save(null, {
            success: function (user) {
              response.success(user);
            },
            error: function (user, error) {
              console.log(error);
              response.error(error);
            }
          });
       }, 
       error:function(error) {
        console.log(error);
          response.error(error);
       }
      });
    }
  });
})

Parse.Cloud.beforeSave("Review", function (request, response) {

  var review = request.object;
  var user = review.get('user');
  var place = review.get('place');

  var Review = Parse.Object.extend('Review');
  var query = new Parse.Query(Review);
  query.equalTo('user', user);
  query.equalTo('place', place);

  query.find({
    success: function (response1) {
      if (response1.length > 0) {
        response.error('You already write a review for this place');
      } else {

        if (review.get('rating') < 1) {
          response.error('You cannot give less than one star');
        } else if (review.get('rating') > 5) {
          response.error('You cannot give more than five stars');
        } else {
          response.success();
        }
      }
    },
    error: function (objReview, error) {
      response.error();
    }
  });
});

Parse.Cloud.afterSave("Review", function (request) {

  var review = request.object;
  var rating = review.get("rating");
  var placeId = review.get("place").id;

  var Place = Parse.Object.extend("Place");
  var query = new Parse.Query(Place);

  query.get(placeId).then(function (place) {

    var currentTotalRating = place.get("ratingTotal");

    if(!currentTotalRating) {
      currentTotalRating = 0;
    }

    Parse.Cloud.useMasterKey();
    place.increment("ratingCount");
    place.set("ratingTotal", currentTotalRating + rating);
    place.save();

  }, function (error) {
    console.warn("Got an error " + error.code + " : " + error.message);
  });
});

Parse.Cloud.beforeSave("Place", function (request, response) {

  var place = request.object;

  place.set("titleLowercase", place.get("title").replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase());

  if (!place.get("monStart")) {
    place.set("monStart","")
  }
  if (!place.get("monFinish")) {
    place.set("monFinish","")
  }
  if (!place.get("tueStart")) {
    place.set("tueStart","")
  }
  if (!place.get("tueFinish")) {
    place.set("tueFinish","")
  }
  if (!place.get("wedStart")) {
    place.set("wedStart","")
  }
  if (!place.get("wedFinish")) {
    place.set("wedFinish","")
  }
  if (!place.get("thuStart")) {
    place.set("thuStart","")
  }
  if (!place.get("thuFinish")) {
    place.set("thuFinish","")
  }
  if (!place.get("friStart")) {
    place.set("friStart","")
  }
  if (!place.get("friFinish")) {
    place.set("friFinish","")
  }
  if (!place.get("satStart")) {
    place.set("satStart","")
  }
  if (!place.get("satFinish")) {
    place.set("satFinish","")
  }
  if (!place.get("sunStart")) {
    place.set("sunStart","")
  }
  if (!place.get("sunFinish")) {
    place.set("sunFinish","")
  }
  if (!place.get("highlights")) {
    place.set("highlights","")
  }
  if (!place.get("food")) {
    place.set("food",false)
  }
  if (!place.get("rooftop")) {
    place.set("rooftop",false)
  }
  if (!place.get("hidden")) {
    place.set("hidden",false)
  }
  if (!place.get("wine")) {
    place.set("wine",false)
  }
  if (!place.get("spirits")) {
    place.set("spirits",false)
  }
  if (!place.get("cider")) {
    place.set("cider",false)
  }
  if (!place.get("cocktails")) {
    place.set("cocktails",false)
  }
  if (!place.get("beer")) {
    place.set("beer",false)
  }
  if (!place.get("image")) {
    /* response.error('Upload the first image');
    place.set("image", "http://lorempixel.com/400/400/nightlife/")*/
    response.success();
    return;
  }

  if (!place.dirty("image") && !place.dirty("imageTwo") &&
   !place.dirty("imageThree") && !place.dirty("imageFour")) {
    response.success();
    return;
  }

  var promises = [];

  if (place.dirty("image")) {
    var url = place.get("image").url();
    promises.push(createMainImagePromise(url));
  }

  if (place.get("imageTwo") && place.dirty("imageTwo")) {
    var column = "imageTwo";
    var url = place.get("imageTwo").url();
    promises.push(createImagePromise(column, url));
  }

  if (place.get("imageThree") && place.dirty("imageThree")) {
    var column = "imageThree";
    var url = place.get("imageThree").url();
    promises.push(createImagePromise(column, url));
  }

  if (place.get("imageFour") && place.dirty("imageFour")) {
    var column = "imageFour";
    var url = place.get("imageFour").url();
    promises.push(createImagePromise(column, url));
  }

  function createMainImagePromise (url) {
    var imageObject;

    return Parse.Cloud.httpRequest({
      url: url
    })
    .then(function (response.buffer) {
      var base64 = buffer.toString("base64");
      var parseFile = new Parse.File("image.jpg", { base64: base64 });
      return parseFile.save();
    })
    .then(function (savedFile) {
      place.set('image', savedFile);
    })
    .then(function () {
      return imageObject.scale({width: 160, height: 160});
    })
    .then(function (image) {
      return image.data();
    })
    .then(function (buffer) {
      var base64 = buffer.toString("base64");
      var parseFile = new Parse.File("imageThumb.jpg", { base64: base64 });
      return parseFile.save();
    })
    .then(function (savedFile) {
      place.set('imageThumb', savedFile);
    });
  }

  function createImagePromise (column, url) {

    var imageObject;

    return Parse.Cloud.httpRequest({
      url: url
    })
    .then(function (response.buffer) {
      var base64 = buffer.toString("base64");
      var parseFile = new Parse.File("image.jpg", { base64: base64 });
      return parseFile.save();
    })
    .then(function (savedFile) {
      place.set(column, savedFile);
    });
  }

  Parse.Promise.when(promises).then(function () {
    response.success();
  }, function (error) {
    response.error(error);
  });

});

Parse.Cloud.afterSave("Crawls", function(request) {
  var participants = request.object.relation("participants");
  participants.query().count({
    success: function (nopart) {
      request.object.set("count",nopart);
      request.object.save();
    },
    error: function (error) {
      console.error("Error deleting related places " + error.code + ": " + error.message);
    }
  }); 
});

Parse.Cloud.beforeSave("Category", function(request, response) {

  var category = request.object;

  if (!category.get("image")) {
   response.error("The field Image is required.");
   return;
  }

  var imageObject;

  Parse.Cloud.httpRequest({
    url: category.get("image").url()
  })
  .then(function(response.buffer) {
    var base64 = buffer.toString("base64");
    var parseFile = new Parse.File("image.jpg", { base64: base64 });
    return parseFile.save();
  })
  .then(function(savedFile) {
    category.set('image', savedFile);
  })
  .then(function() {
    return imageObject.scale({width: 160, height: 160});
  })
  .then(function(image) {
    return image.data();
  })
  .then(function(buffer) {
    var base64 = buffer.toString("base64");
    var parseFile = new Parse.File("imageThumb.jpg", { base64: base64 });
    return parseFile.save();
  })
  .then(function(savedFile) {
    category.set('imageThumb', savedFile);

  }).then(function() {
    response.success();
  },
  function(error) {
    response.error(error);
  });

});

Parse.Cloud.afterDelete("Category", function (request) {

  var query = new Parse.Query("Places");
  query.equalTo("category", request.object);

  query.find().then(function (places) {
    return Parse.Object.destroyAll(places);
  }).then(function(success) {
    console.log(success);
  }, function(error) {
    console.error("Error deleting related places " + error.code + ": " + error.message);
  });

});
