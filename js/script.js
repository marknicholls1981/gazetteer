const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let weatherButton;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

weatherButton = L.easyButton('<i class="fas fa-cloud-sun"></i>', function () {
  $("#weathermodal").modal("show");
}, 'Latest Weather').addTo(mymap);

infoButton = L.easyButton('<i class="fas fa-info"></i>', function () {
  $("#infomodal").modal("show");
}, 'Country Information').addTo(mymap);

newsButton = L.easyButton('<i class="far fa-newspaper"></i>', function() {
  $('#newsmodal').modal("show");
},
  'Latest News').addTo(mymap)


let lat;
let lon;

navigator.geolocation.getCurrentPosition((position) => {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  mymap.setView([lat, lon], 7);
 
  $.ajax({
    url: "php/getLocation.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: lat,
      lon: lon
    },
    success: function (result) {

      if (result.status.name == "ok") {

        $('#countries').val(result.data).change()      
      }
  
      
    },
    error: function (jqXHR, textStatus, errorThrown) {
    }
  })

});

let $select = $("#countries");

$.getJSON("php/countryBorders.geo.json", (data) => {
  $select.html("");
  $select.append(`<option value="make_selection"selected disabled> Select a country</option>`);

  const features = data["features"].sort((a, b) => {
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

$("#countries").change(function () {

  $.ajax({
    url: "php/getCountry.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: $("#countries").val(),
    },
    success: (result) => {
      if (result.status.name == "ok") {


        if (mymap.hasLayer(border)) {
          mymap.removeLayer(border);
        }
       
        let myStyle = {
          "color": " #b53fe8",
          "weight": 8,
          "opacity": 0.2
        };
        if (result.data != null) {

          border = L.geoJson(result.data, {
            style: myStyle
          }).addTo(mymap)
          mymap.fitBounds(border.getBounds());

        }
        else {
          alert("Border not available for current location")
          $('#countries').val('make_selection')
        }

        $.ajax({
          url: "php/countryInfo.php",
          type: 'POST',
          dataType: 'json',
          data: {
            country: $("#countries").val(),
          },

          success: function (result) {

            if (result.status.name == "ok") {
              $('.headline').html("Not available in this region")
              
              $('.newslink').removeAttr('href')
              $('.newslink').html("not available in this region")
           
              $("#summary").html('Information currently not available');
              $("#furtherinfo").html('Information currently not available');
              $("#furtherinfo").removeAttr("href");
              $('.newsimagelink').removeAttr('src')
              $('.newsimagelink').removeAttr('href')
              $('.newsimagelink').attr("alt", "No Image available.")

              $('#capital').html(result['data'][0]['capital']);
              $('#country').html(result['data'][0]['countryName']);
              $('#population').html(result['data'][0]['population']);
              $('#continent').html(result['data'][0]['continentName']);
              let flagcode = $("#countries").val()
              $('.flag').attr("src", `https://www.countryflags.io/${flagcode}/flat/64.png`)

              let currencyCode = result['data'][0]['currencyCode']
              let city = $('#capital').html(result['data'][0]['capital']).text();

              $.ajax({

                url: "php/getwikiinfo.php",
                type: 'POST',
                dataType: 'json',
                
                data: {
                  city: city
                },
                success: function (result) {
                  
                  if (result.status.name == "ok") {
                 
                    let info_array = result.data
                       
                     for(i=0; i < info_array.length; i++){
                       if(info_array[i]['countryCode'] ===  $('#countries').val() )
                       
                       {$("#summary").html(info_array[i]['summary']);
                       $("#furtherinfo").attr("href", `https://${info_array[i]['wikipediaUrl']}`);
                       $("#furtherinfo").html(info_array[i]['wikipediaUrl']);
                       let weatherlat = result['data'][i]['lat']
                                            
                      
              
                    let weatherlon = result['data'][i]['lng']
                   
                    $.ajax({

                      url: "php/getWeatherInfo.php",
                      type: "POST",
                      dataType: "json",
                      data: {
                        lat: weatherlat,
                        lon: weatherlon
                      },
                      success: function (result) {

                        
              
      
                        if (result.status.name == "ok") {
                          const now = new Date()
                          const currentYear = now.getFullYear()
                          const month = now.getMonth()
                          const day = now.getDay()
                          const date = now.getDate()
                         let todaysDate = `${currentYear}-${month+1}-${date} `
                         let city = result.data.city['name']
                         $(".city").html(city)

                        $(".date").html(`${now.toDateString()}`)
                         weatherList = result.data.list
                 
                         for(i=0; i<weatherList.length;i++){
                          let date = weatherList[i]['dt']
                          let weathericon = weatherList[0]['weather'][0]['icon']
                          let weatherdescription = weatherList[0]['weather'][0]['description']
                          let windDirection = weatherList[0]['wind']['deg']
                          let temperature = weatherList[0]['main']['temp']
                          $('#temp').html(`${temperature}°`)
                          $('.weathericon').attr("src", `http://openweathermap.org/img/wn/${weathericon}@2x.png`)
                          $('#weatherdescription').html(weatherdescription)
                          $('#wind').html(`${windDirection}°`)


                         }
                         $.ajax({

                          url: "php/news.php",
                          type: "POST",
                          dataType: "json",
                          data: {
                            country: $('#countries').val()
                          },
                          success: function (result) {
                            let news = result.data[0]
                  
                            let headline = news['title']
                            let newsLink = news['url']
                            let newsImageLink = news['urlToImage']
                    
                            $('.headline').html(headline)
                            $('.newsimagelink').attr('src', newsImageLink)
                            $('.newsimagelink').attr('href', newsImageLink)
                            $('.newslink').attr('href', newsLink)
                            $('.newslink').html(newsLink)
                  
                        
                  
                          },
                          error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Error");
                  
                          },
                        });
                   
                        }
      
                      },
                      error: function (jqXHR, textStatus, errorThrown) {
                        console.log("Error");
      
                      },
                    });
                       break

                       }
   }
                  }
                  else{
                    alert("Further information not avaivle.")
                  }
                }
              })

            }
          },
          error: function (jqXHR, textStatus, errorThrown) {

          }

        });
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log('error');
    },
  });

});

$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(100)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});