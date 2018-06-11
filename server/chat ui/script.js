var j = 0, k = 0;
var l=0;
var latitude= 0.0;
var longitude = 0.0;

function getLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(showPosition);
   }
}
function showPosition(position) {
  latitude=position.coords.latitude;
  longitude=position.coords.longitude;
}

function sendMessage(){
    var msg = document.getElementById("message").value;
    var chatBody = document.getElementById("chat-body");
    chatBody.innerHTML += "<div class='user-message-container' tabindex='1'><div class='user-message'>" + msg + "</div></div>";
    sendAjax(msg)
    document.getElementById("message").value = "";
    chatBody.lastChild.focus();

    //console.log("Calling aJAX");

}
function sendAjax(msg){
  $.ajax({
  url: 'http://restaurantfinderchatbot-env.vtfdfj43h8.us-east-2.elasticbeanstalk.com/response',
  dataType: "json",
  type: 'POST',
  headers: {
    "Accept" : "application/json",
    "Content-type": "application/json",
  },
  data: JSON.stringify( { "msg":msg,"lat":latitude,"lon":longitude} ),
  processData: false,
  success: function( response, textStatus, jQxhr ){

      //console.log(textStatus);
      if (response['tag']=='regular'){
        var chatBody = document.getElementById("chat-body");
        chatBody.innerHTML += "<div class='bot-message-container' tabindex='1'><div class='bot-picture'><img src='https://coveragebot.com/assets/bot-profile-icon-ced2b76758f61d0785e048d561c3c5f062e576f4067581cc39f17ff6945348d2.png' alt='bot-profile-pic'>"+
                "</div>"+
                "<div class='bot-message'>"+response['response']+"</div>"+
                "</div>";
        document.getElementById("message").value = "";
        chatBody.lastChild.focus();
      }
      else if (response['tag']=='category'){
          j++;
          //console.log(j);
          //var count = Object.keys(response['category']).length;
          var chatBody = document.getElementById("chat-body");
          //console.log(chatBody.innerHTML);
          chatBody.innerHTML += "<div class='bot-message-container' tabindex='1'><div class='bot-picture'><img src='https://coveragebot.com/assets/bot-profile-icon-ced2b76758f61d0785e048d561c3c5f062e576f4067581cc39f17ff6945348d2.png' alt='bot-profile-pic'>"+
                  "</div>"+
                  "<div class='bot-message'>"+response['response']+"</div>"+
                  "</div><div class='categories'><div class='categories-flex' id='categoriesflex" + j + "'></div>";
          var categoryBody = document.getElementById("categoriesflex"+j);
          for(var i =0 ; i<13 ;i++){
            categoryBody.innerHTML += "<div class='category-button'>"+response['category'][i]+"</div>";
          }

          document.getElementById("message").value = "";
          chatBody.lastChild.focus();

      }
      else if (response['tag']=='restaurants'){
          k++;
          var chatBody = document.getElementById("chat-body");
          var resBody;
          chatBody.innerHTML += "<div class='bot-message-container' tabindex='1'><div class='bot-picture'><img src='https://coveragebot.com/assets/bot-profile-icon-ced2b76758f61d0785e048d561c3c5f062e576f4067581cc39f17ff6945348d2.png' alt='bot-profile-pic'>"+
                                "</div>"+
                                "<div class='bot-message'>"+response['response']+"</div>"+
                                "</div><div class='restaurant-container'><div class='restaurant-flex' id='restaurantsflex" + k + "'>";

          var resBody = document.getElementById("restaurantsflex"+k);
          console.log("restaurantsflex" + k);
          for (var i =0 ;i < 4; i++){
                resBody.innerHTML +="<div class='restaurant'>"+
                                      "<div class='name-and-image'>"+
                                      "<div class='restaurant-image'>"+
                                      "<img src="+response['restaurants'][i]['image_url']+"></div>"+
                                      "<span>"+response['restaurants'][i]['name']+"</span></div>"+
                                        "<div class='restaurant-details'>"+
                                        "<div class='name-and-id'>"+
                                          "<div class='restaurant-id' onclick='addId(this)'>"+response['restaurants'][i]['id']+"</div>"+
                                          "<div class='rating'>"+response['restaurants'][i]['rating']+"</div>"+
                                        "</div>"+
                                        "<div class='restaurant-address'>"+response['restaurants'][i]['address']+"</div>"+
                                        "<div class='cost'>Cost for two :"+response['restaurants'][i]['currency']+response['restaurants'][i]['average_cost_for_two']+"</div>"+
                                        "<div class='cuisine'>"+response['restaurants'][i]['cuisines']+"</div>"+
                                        "<div class='restaurant-distance'>"+response['restaurants'][i]['distance']+"</div>"+
                                        "<div class='view-more'><a href="+response['restaurants'][i]['view_more'] +">View More</a></div>"+
                                      "</div>"+
                                    "</div>";
          }
          resBody.innerHTML+="</div></div>";
          document.getElementById("message").value = "";
          chatBody.lastChild.focus();


      }
      else{
        var chatBody = document.getElementById("chat-body");
        chatBody.innerHTML += "<div class='bot-message-container' tabindex='1'><div class='bot-picture'><img src='https://coveragebot.com/assets/bot-profile-icon-ced2b76758f61d0785e048d561c3c5f062e576f4067581cc39f17ff6945348d2.png' alt='bot-profile-pic'>"+
                "</div>"+
                "<div class='bot-message'>"+"I have no idea!!"+"</div>"+
                "</div>";
        document.getElementById("message").value = "";
        chatBody.lastChild.focus();

      }

  },
  error: function( jqXhr, textStatus, errorThrown ){
      console.log( errorThrown );
  }
});
}
