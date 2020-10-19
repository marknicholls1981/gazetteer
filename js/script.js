const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0,0],1);
let border;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

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
  
  const features = data["features"].sort((a,b) => {
    return (
      (a.properties.name < b.properties.name && -1) ||
      (a.properties.name > b.properties.name && 1) ||
      0
    ); 
  });
  
  features.forEach(feature => {
    $select.append(`<option value="${feature.properties.iso_a2}">${feature.properties.name}</option>`);
  });
});


//lookup country







//------------------
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


