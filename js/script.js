const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0,0],1);
let border;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


navigator.geolocation.getCurrentPosition((position) => {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  let currentLocation = mymap.setView([lat, lon], 7);
  
  let marker = L.marker([lat,lon]).addTo(mymap)
  let popup = L.popup().setLatLng([lat,lon]).setContent("You are here").openOn(mymap)

  let countryCode;
  
  $.ajax({
    url: "php/getLocation.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: lat,
      lon: lon
    },
    success: function(result) {

      
      if (result.status.name == "ok") {                    
       
      countryCode = result['data']
            
       
      }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      
    }
  })

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
    
            if (result.status.name == "ok") {                    
         
             
             
              $('#capital').html(result['data'][0]['capital']);
              $('#country').html(result['data'][0]['countryName']);
              $('#population').html(result['data'][0]['population']);
              $('#continent').html(result['data'][0]['continentName']);
              let city = $('#capital').text()
              let currencyCode = result['data'][0]['currencyCode']
              console.log(currencyCode)
                       
              
              $.ajax({

                url:"php/getwikiinfo.php",
                type:'POST',
                dataType: 'json',
                data:{
              
                  city : city
              
                },
                success: function(result){
              
                
                  if(result.status.name == "ok"){
                    
                    $("#furtherinfo").attr("href", `https://${result['data'][0]['wikipediaUrl']}`);
                    $('#furtherinfo').html(result['data'][0]['wikipediaUrl'])
                    let lat = result['data'][0]['lat']
                    let lon = result['data'][0]['lng']
                                     
                  }
              
                 


                }
              })
              $.ajax({

                url: "php/getWeatherInfo.php",
                type: "POST",
                dataType: "json",
                data: {
                  lat: lat,
                  lon:lon
                },
                success: function (result) {
                
            
                  if (result.status.name == "ok") {
                    $("#temp").html(`${result["data"]["temperature"]}°`);
                    $("#wind").html(`${result["data"]["windDirection"]}°`);
                    
                  }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  console.log("Error");
                  // your error code
                },
              });

             
                            
             
             
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






