const apiToken =
  "pk.eyJ1IjoiY3VzeDE5ODEiLCJhIjoiY2tmZTN1d2VzMDE5MDJ6cGVlcHVvbzV1dCJ9.nhmqapMZZRVeMQZXFOkAQA";

let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let weatherButton;
let ratesButton;

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

ratesButton = L.easyButton('<i class="fas fa-dollar-sign"></i>', function() {
    $("#ratesmodal").modal("show");
  },
    'Exchange Rates').addTo(mymap)


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
let $articles = $("#articles");
let $weatherinfo = $('#weatherinfo')

let $rates = $("#rates");

$.getJSON("php/countryBorders.geo.json", (data) => {
 
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
  $articles.html("<h3>Sorry, there are no news articles available for this region.</h3>")

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
          //console.log(result)

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
              //console.log(result)
              //console.log($("#countries").val())

              $("#summary").html('Unavailable');
              $weatherinfo.html('<h3>Sorry, there is no weather forecast currently available for this region.</h3>');
             
              
              $("#furtherinfo").removeAttr("href");
              $("#furtherinfo").html("Unavailable").css("color", "black !important");
                                     
              $('#capital').html(result['data'][0]['capital']);
              $('#country').html(result['data'][0]['countryName']);
              $('#population').html(result['data'][0]['population']);
              $('#continent').html(result['data'][0]['continentName']);
              let flagcode = $("#countries").val()
              $('.flag').attr("src", `https://www.countryflags.io/${flagcode}/shiny/64.png`)

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
                    let weatherlat;
                    let weatherlon;

                    //console.log(info_array)

                   
                   
                        for(i=0; i < info_array.length; i++){
                          if(info_array[i]['countryCode'] ===  $('#countries').val() )
                          
                          {$("#summary").html(info_array[i]['summary']);
                          $("#furtherinfo").attr("href", `https://${info_array[i]['wikipediaUrl']}`);
                          $("#furtherinfo").html(info_array[i]['wikipediaUrl']);
                          weatherlat = result['data'][i]['lat']
                                               
                         
                 
                       weatherlon = result['data'][i]['lng']
                      
                    
                   
                    $.ajax({

                      url: "php/getWeatherInfo.php",
                      type: "POST",
                      dataType: "json",
                      data: {
                        lat: weatherlat,
                        lon: weatherlon
                      },
                      success: function (result) {  
                        $weatherinfo.html("")
                                
      
                        if (result.status.name == "ok") {
                          const now = new Date()
                          const currentYear = now.getFullYear()
                          const month = now.getMonth()
                          const day = now.getDay()
                          const date = now.getDate()
                         let todaysDate = `${day}-${date}-${month+1}-${currentYear}`
                         let city = result.data.city['name']
                         //console.log(todaysDate)
                         $(".city").html(city)

                        $(".date").html(`${now.toDateString()}`)
                         weatherList = result.data.list
                         console.log(weatherList)

                         if (weatherList < 1){
                          $weatherinfo.html('<h3>Sorry, there is no weather forecast currently available for this region.</h3>');


                         }
                                          
                         else{
                          {
                            for(i=0; i<weatherList.length;i++){
                              let theDate = new Date(weatherList[i]['dt_txt'])
                           

                            



let month;
let day;

switch(theDate.getDay()){
  case 0:
    day = "Sunday";
    break;
  case 1:
    day = "Monday";
    break;
  case 2:
     day = "Tuesday";
    break;
  case 3:
    day = "Wednesday";
    break;
  case 4:
    day = "Thursday";
    break;
  case 5:
    day = "Friday";
    break;
  case 6:
    day = "Saturday";

}
switch(theDate.getMonth()){
  case 0:
    month = "January";
    break;
  case 1:
    month = "February";
    break;
  case 2:
     month = "March";
    break;
  case 3:
    month = "April";
    break;
  case 4:
    month = "May";
    break;
  case 5:
    month = "June";
    break;
  case 6:
    month = "July";
    case 7:
      month = "August";
      break;
    case 8:
      month = "September";
      break;
    case 9:
       month = "October";
      break;
    case 10:
      month = "November";
      break;
    case 11:
      month = "Decembet";
    

}






$weatherinfo.append( ` 
<div class="container-fluid">

<div class="row">

<div class="col-sm-12 weatherrow">
<table id="information weathertable">                              
<tr><td>${day} ${theDate.getDate()} ${month} ${theDate.getHours()}:${theDate.getMinutes()}${theDate.getSeconds()}</td><td><img class="weathericon" src ="http://openweathermap.org/img/wn/${weatherList[i]['weather'][0]['icon']}@2x.png"></td> 




<td id="temp" >${weatherList[i]['main']['temp']}°</td>           
    
<td></td><td id="weatherdescription" >${weatherList[i]['weather'][0]['description']}</td> 
</tr>      
  

</table>
</div>
</div>
</div>

`)
                            }



                                         
  
  
                           }

                         }
                       
                       
                         $.ajax({

                          url: "php/news.php",
                          type: "POST",
                          dataType: "json",
                          data: {
                            country: $('#countries').val()
                          },
                          success: function (result) {
                            let news = result.data
                            //console.log(news)
                            $articles.html("")
                           if (news.length < 1){

                            $articles.html("<h3>Sorry, there are no news articles available for this region.</h3>")
                           }
                           else{
                            for (i=0;i<10;i++){
                              
                              
                              $articles.append(`<div class="row articlerow"> <div class="col-sm-6 news"><a class="newsimagelink" src="${news[i]['urlToImage']}" href="${news[i]['urlToImage']}" target="_blank"><img src="${news[i]['urlToImage']}" href="${news[i]['urlToImage']} class="newsimagelink" style="width:308px;height:173px;" alt="No Image Available"></a></div>
                            
                              <div class="col-sm-6 news  "><a href="${news[i]['url']}"class="headline" target="_blank">${news[i]['title']}</a><p>${news[i]['description']}</p></div></div>`)



                            }



                           }   
                           $.ajax({

                            url: "php/exchangerates.php",
                            type: "POST",
                            dataType: "json",
                            data: {
                              currencycode: currencyCode
                            },
                            success: function (result) {
                              let rates = result.data.rates
                              console.log(rates)
                              //console.log($('#country').text())
                              $rates.html(rates)

                             
                             
                             
                      
                    
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                              console.log("Error");
                    
                            },
                          });
                           
                         
                    
                  
                          },
                          error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Error");
                  
                          },
                        });
                   
                        }
      
                      },
                      error: function (jqXHR, textStatus, errorThrown) {
                        $articles.html("<h3>Sorry, there are no news articles available for this region.</h3>")
      
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