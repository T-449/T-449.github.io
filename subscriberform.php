<?php


if($_POST["message"]) {

    $sender_email = $_POST["email"];
    $sender_name = $_POST["fullname"];

    $subject = 'Mail from' . ' ' . $sender_name . ' via your website'; 
    $msg = $_POST["message"] . ' Sender email: ' . $sender_email;

    $msg = wordwrap($msg, 70, "<br>\n");

    mail("tushin.mallick2010@gmail.com", $subject, $msg);


}


?>