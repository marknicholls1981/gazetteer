
const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let capitalButton;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


navigator.geolocation.getCurrentPosition((position) => {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  let currentLocation = mymap.setView([lat, lon], 7);
  console.log(position)

  let countryCode;

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

        let currentLocationBorder = $('#countries').val(result).change()
        

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
        if (mymap.hasLayer(capitalButton)) {
          mymap.removeLayer(capitalButton);
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
          console.log(border)

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

              $('#capital').html(result['data'][0]['capital']);
              $('#country').html(result['data'][0]['countryName']);
              $('#population').html(result['data'][0]['population']);
              $('#continent').html(result['data'][0]['continentName']);
              let city = $('#capital').text()
              let currencyCode = result['data'][0]['currencyCode']

              console.log(currencyCode)
              console.log(city)

              $.ajax({

                url: "php/getwikiinfo.php",
                type: 'POST',
                dataType: 'json',
                data: {

                  city: city

                },
                success: function (result) {
                  console.log(result['data'])

                  if (result.status.name == "ok") {

                    $("#furtherinfo").attr("href", `https://${result['data'][0]['wikipediaUrl']}`);
                    let url = result['data'][0]['wikipediaUrl']
                    let lat = result['data'][0]['lat']
                    let lon = result['data'][0]['lng']
                    let summary = result['data'][0]['summary']
                    $("#summary").html(summary);
                    $("#furtherinfo").html(url);
                    $('#landmark').attr("src", `${result['data'][0]['thumbnailImg']}`)
                    console.log(lat, summary)
                    const capitalPopup = L.popup().setContent(`${city}`);

                    capitalButton = L.easyButton('./images/raining.png', function (btn, map) {
                      capitalPopup.setLatLng([lat, lon]).openOn(map);
                    }).addTo(mymap);





                  }

                }
              })
              $.ajax({

                url: "php/getWeatherInfo.php",
                type: "POST",
                dataType: "json",
                data: {
                  lat: lat,
                  lon: lon
                },
                success: function (result) {

                  if (result.status.name == "ok") {
                    $("#temp").html(`${result["data"]["temperature"]}°`);
                    $("#wind").html(`${result["data"]["windDirection"]}°`);

                  }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  console.log("Error");

                },
              });

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






