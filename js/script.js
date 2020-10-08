const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

navigator.geolocation.getCurrentPosition((position) => {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let mymap = L.map("map").setView([lat, lon], 13);
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
});

let $select = $("#countries");

$.getJSON("countries/countries_small.geo.json", (data) => {
  $select.html("");

  // console.log(data);
  for (let i = 0; i < data["features"].length; i++) {
    $select.append(
      '<option value="' +
        data["features"][i]["id"] +
        '">' +
        data["features"][i]["properties"]["name"]
    );
  }
});

let country = $("#countries").val();
$("#countries").change(() => {
  $.ajax({
    url: "php/getCountry.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: country,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        console.log(result);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log(result.status.name);
    },
  });
});
