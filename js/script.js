let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let weatherButton;
let ratesButton;
let dates = []
let times = []
let capitalMarker;
let popup;
let country;
let $rates;
$rates = $("#rates");



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
let $columns = $('#columns')



let $weathertitle = $(".weathertitle")
let $newstitle = $(".newstitle")
let $exchangetitle = $(".exchangetitle")

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
  $articles.html("<p>Sorry, there are no news articles available for this region.</p>")

  $("#furtherinfo").html("Unavailable").css("color", "black !important");

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
              
              //console.log($("#countries").val())

              $("#summary").html('Unavailable');
              $weatherinfo.html('<p>Sorry, there is no weather forecast currently available for this region.</p>');
              $rates.html("<p>Sorry, there is no exchange rate information currently available for this region.</p>")
              
              $columns.html("")
             
             
              
              $("#furtherinfo").removeAttr("href");
              //$("#furtherinfo").html("Unavailable").css("color", "black !important");
              country = result['data'][0]['countryName']        
              $('#capital').html(result['data'][0]['capital']);
              $('#country').html(country);
              $('#population').html(numberWithCommas((result['data'][0]['population'])));
              $('#continent').html(result['data'][0]['continentName']);
              let flagcode = $("#countries").val()
              $('.flag').attr("src", `https://www.countryflags.io/${flagcode}/shiny/64.png`)

              let currencyCode = result['data'][0]['currencyCode']
              let city = $('#capital').html(result['data'][0]['capital']).text();
              
              let cityNoSpaces = city.split(' ').join('')
            
              $weathertitle.html(`<h4>5 day weather forecast for ${city}, ${country}</h4>`)
              $newstitle.html(`<h4>Latest News for ${city}, ${country}</h4>`)
              $exchangetitle.html(`<h4>Latest exchange rates for ${country}, ${currencyCode}</h4>`)

              

              $.ajax({

                url: "php/getwikiinfo.php",
                type: 'POST',
                dataType: 'json',
                
                data: {
                  city: cityNoSpaces
                },
                success: function (result) {
                 

                
                  
                  if (result.status.name == "ok") {
                 
                    let info_array = result.data
                    let weatherlat;
                    let weatherlon;

                      
                   
                   
                        for(i=0; i < info_array.length; i++){
                         

                          if (mymap.hasLayer(popup)) {
                            mymap.removeLayer(popup);
                          }

                          

                          if(info_array[i]['countryCode'] ===  $('#countries').val() )
                          
                          {
                            $("#summary").html(info_array[i]['summary']);
                          $("#furtherinfo").attr("href", `https://${info_array[i]['wikipediaUrl']}`);
                          $("#furtherinfo").html(info_array[i]['wikipediaUrl']);

                          weatherlat = result['data'][i]['lat']                
                       weatherlon = result['data'][i]['lng']
                      thumbNailImage = result['data'][i]['thumbnailImg']
                     
                      if(thumbNailImage){
                        border.bindTooltip(`<h6>${city}, ${country}</h6><img src="${thumbNailImage}" class="capitalimage"/>`)

                      }
                      else {
                        border.bindTooltip(`<h6>${city}, ${country}</h6><img src="./images/blank.jpg" class="capitalimage"/>`)

                      }
                      if(info_array.length < 1){
                        border.bindTooltip(`<h6>${city}, ${country}</h6><img src="./images/blank.jpg" class="capitalimage"/>`)

                      }

                     

                      
                    
                   
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
                        
                         
                         let weather = result.weather
                         
                         if(weather < 1){
                           $weatherinfo.html("<p>Sorry, there is no weather forecast currently available for this region.</p>")
                         }

                         else{
                          for (i=0;i<weather.length;i++){
                              
                              
                            $weatherinfo.append(`<div class="row weatherrow">
                            
                            <div class="col-sm-3 summary my-auto" id="weatherinfo">${weather[i][0]}</div>

                            <div class="col-sm-3 summary"><img src=" http://openweathermap.org/img/wn/${weather[i][3]}@2x.png" style="width:50%;" ></div>


                      
                            <div class="col-sm-3 summary my-auto" id="weatherinfo">${weather[i][1]}°</div>
                            <div class="col-sm-3 summary description my-auto" id="weatherinfo">${weather[i][4]}</div>
                            </div>`)



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

                            $articles.html("<p>Sorry, there are no news articles available for this region.</p>")
                           }
                           else{
                            for (i=0;i<10;i++){
                              
                              
                              $articles.append(`<div class="row articlerow"> <div class="col-sm-6 news my-auto"><a class="newsimagelink" href="${news[i]['urlToImage']}" target="_blank"><img src="${news[i]['urlToImage']}" href="${news[i]['urlToImage']} class="newsimagelink" style="width:100%;" alt="No Image Available"></a></div>
                            
                              <div class="col-sm-6 news  "><a href="${news[i]['url']}"class="headline" target="_blank">${news[i]['title']}</a></div></div></div>`)



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
                              if(result.data.rates){
                                 let exchangerates = result.data.rates
                              // console.log(result)

                             $rates.html("")
                              
                              
                             //console.log(rates)
                             for (let rate in exchangerates) {

                              
                                 
                                 $rates.append(`<div class="row exchangerow">
                               <div class="col-sm-6">${rate}</div>
                               <div class="col-sm-6">${exchangerates[rate].toFixed(2)}</div>
                               </div></div>`);
                               

                                                            
                             
                             
                             }
                              }
                              else{
                               
                                $rates.html("<p>Sorry, there is no exchange rate information currently available for this region.</p>")

                              }

                             


                              

                             
                             
                             
                      
                    
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
                        $articles.html("<p>Sorry, there are no news articles available for this region.</p>")
      
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