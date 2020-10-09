<?php

$jsondata = file_get_contents("countryBorders.geo.json");
$json = json_decode($jsondata, true);


print_r($json);
header("Content-type: application/json");


?>