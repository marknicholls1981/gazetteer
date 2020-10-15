const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0,0],1);
let border;
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
    apiToken,
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiToken,
  }
).addTo(mymap);

navigator.geolocation.getCurrentPosition((position) => {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let currentLocation = mymap.setView([lat, lon], 7);
  
  let marker = L.marker([lat,lon]).addTo(mymap)
  let popup = L.popup().setLatLng([lat,lon]).setContent("You are here").openOn(mymap)

  console.log(position)

  

});



let $select = $("#countries");

$.getJSON("php/countryBorders.geo.json", (data) => {
  $select.html("");

  for (let i = 0; i < data["features"].length; i++) {
    $select.append(
      '<option value="' +
        data["features"][i]['properties']["iso_a2"] +
        '">' +
        data["features"][i]["properties"]["name"]
    );
    
  }
});

$("#countries").change(function() {
  $.ajax({
    url: "php/getCountry.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: $("#countries").val(),   
    },
    success: (result) => {
      if (result.status.name == "ok") {
              
        
              if (mymap.hasLayer(border)){
          mymap.removeLayer(border);
        }
        border = L.geoJson(result.data).addTo(mymap);
        mymap.fitBounds(border.getBounds());  
        $.ajax({
          url: "php/countryInfo.php",
          type: 'POST',
          dataType: 'json',
          data: {
            country: $("#countries").val(),
          },
          success: function(result) {
    
            console.log(result);
            if (result.status.name == "ok") {                    
             console.log(result['data'])
             
             
              city = $('#capital').html(result['data'][0]['capital']);
              $('#country').html(result['data'][0]['countryName']);
              $('#population').html(result['data'][0]['population']);
              $('#continent').html(result['data'][0]['continentName']);
             
             
            }
          
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // your error code
          }
        }); 
          }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log('error');
    },
}); 



});


