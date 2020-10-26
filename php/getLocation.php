<?php

$url = 'api.geonames.org/countrySubdivisionJSON?lat=' . $_REQUEST['lat']  . '&lng=' .  $_REQUEST['lon']  . '&username=cusx1981';


$executionStartTime = microtime(true) / 1000;
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
$output['data'] = $decode['countryCode'];
	
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>