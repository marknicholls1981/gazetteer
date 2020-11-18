<?php

$executionStartTime = microtime(true) / 1000;

$appid = "4ebd14a3b99b7dfbf2da8e3b9947df56";

$url = 'api.openweathermap.org/data/2.5/forecast?lat='. $_REQUEST['lat'] .'&lon=' . $_REQUEST['lon'] .'&units=metric&APPID='. $appid;

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
	
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>