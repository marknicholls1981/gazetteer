let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let weatherButton;
let ratesButton;
let dates = []
let times = []

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
              $columns.html("")
             
             
              
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
                        $columns.html("")
                       
                                
      
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
                          $columns.html("")
                          


                         }
                                          
                         else{
                          {
                            for(i=0; i<weatherList.length;i++){
                              let theDate = new Date(weatherList[i]['dt'] * 1000)
                              
                           

                            



let month;
let day;

switch(theDate.getDay()){
  case 0:
    day = "Sun";
    break;
  case 1:
    day = "Mon";
    break;
  case 2:
     day = "Tue";
    break;
  case 3:
    day = "Wed";
    break;
  case 4:
    day = "Thur";
    break;
  case 5:
    day = "Fri";
    break;
  case 6:
    day = "Sat";

}
switch(theDate.getMonth()){
  case 0:
    month = "Jan";
    break;
  case 1:
    month = "Feb";
    break;
  case 2:
     month = "Mar";
    break;
  case 3:
    month = "Apr";
    break;
  case 4:
    month = "May";
    break;
  case 5:
    month = "Jun";
    break;
  case 6:
    month = "Jul";
    case 7:
      month = "Aug";
      break;
    case 8:
      month = "Sep";
      break;
    case 9:
       month = "Oct";
      break;
    case 10:
      month = "Nov";
      break;
    case 11:
      month = "Dec";
    

}

let date = theDate.getDate()

if (date === 1 || date === 21 || date === 31){

  date = date + 'st'
}
else if( date === 2 || date === 22) {
  date = date + 'nd'
}

else if(date === 3 || date === 23){
  date = date + 'rd'
}

else{
  date = date + 'th'
}

let hours = theDate.getHours()
let minutes = theDate.getMinutes()
let seconds = theDate.getSeconds()
let weathericon = weatherList[i]['weather'][0]['icon']
let temperature = weatherList[i]['main']['temp']
let description = weatherList[i]['weather'][0]['description']
let newDates;
let newTimes;

console.log(theDate.getDate())





  dates.push(`${day} ${date}`)
 
   
  








// $weatherinfo.append( ` 
// <div class="container-fluid">

// <div class="row">

// <div class="col-sm-12 weatherrow">
// <table id="information weathertable">                              
// <tr><td>${day} ${date} ${month} ${hours}:${minutes}${seconds}</td><td><img class="weathericon" src ="http://openweathermap.org/img/wn/${weathericon}@2x.png " style="width:50%;"></td> 




// <td id="temp" >${temperature}°</td>           
    
// <td></td><td id="weatherdescription" >${description}</td> 
// </tr>      
  

// </table>
// </div>
// </div>
// </div>

// `)

                            }
                            

                            function getUnique(array){
                              let uniqueArray = [];
                              
                              // Loop through array values
                              for(i=0; i < array.length; i++){
                                  if(uniqueArray.indexOf(array[i]) === -1) {
                                      uniqueArray.push(array[i]);
                                  }
                              }
                            
                              return uniqueArray;
                            }
                            newDates = getUnique(dates)
                           console.log(dates)
                            
                           
                          

                            newDates.forEach(column =>{ 
                              console.log(column)

                              $columns.append(`<th>${column}</th>`)
                             


                            })
                            console.log($columns)
                            


                  
                          



                                         
  
  
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
                              
                              
                              $articles.append(`<div class="row articlerow"> <div class="col-sm-6 news"><a class="newsimagelink" href="${news[i]['urlToImage']}" target="_blank"><img src="${news[i]['urlToImage']}" href="${news[i]['urlToImage']} class="newsimagelink" style="width:100%;" alt="No Image Available"></a></div>
                            
                              <div class="col-sm-6 news  "><a href="${news[i]['url']}"class="headline" target="_blank">${news[i]['title']}</a></div></div>`)



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
                              $rates.html("")
                              let rates = result.data.rates['AUD']
                              console.log()
                              //console.log($('#country').text())
                              $rates.append(`<p>${rates}</p>`)

                             
                             
                             
                      
                    
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