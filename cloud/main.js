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

