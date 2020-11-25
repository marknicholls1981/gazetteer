<?php

$executionStartTime = microtime(true) / 1000;

$appid = "4ebd14a3b99b7dfbf2da8e3b9947df56";
$url = 'api.openweathermap.org/data/2.5/forecast?lat='. $_REQUEST['lat'] .'&lon=' . $_REQUEST['lon'] .'&units=metric&APPID='. $appid;
// $url = 'api.openweathermap.org/data/2.5/forecast?lat=51&lon=14&units=metric&APPID='. $appid;


$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

if ($result === FALSE) {
	echo "cURL Error" . curl_error($ch);
}

curl_close($ch);

$decode = json_decode($result, true);
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

$output['weather'] = [];
$weatherday;



for($i = 0; $i < count($output['data']['list']); $i++)


{
    $weatherday = date('l',$output['data']['list'][$i]['dt']);
    $weathertime = date('H:i',$output['data']['list'][$i]['dt']);  
    $weatherdate = date('D jS\ M',$output['data']['list'][$i]['dt']);
    $temp = $output['data']['list'][$i]['main']['temp'];
	$feelsLike = $output['data']['list'][$i]['main']['feels_like'];
	$weatherIcon = $output['data']['list'][$i]['weather'][0]['icon'];
	$description = $output['data']['list'][$i]['weather'][0]['description'];
	$windspeed = $output['data']['list'][$i]['wind']['speed'];
    $windDirection = $output['data']['list'][$i]['wind']['deg'];
    //echo $weatherdate;

    if($weathertime == "13:00" || $i == 0){
        array_push($output['weather'], [$weatherdate, $temp," Feels like $feelsLike", $weatherIcon, $description,"Wind Speed $windspeed","Wind Direction $windDirection" ]);
    
    };
     
        
};




header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
