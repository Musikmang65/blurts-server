"use strict";
/* global ga */

function sendEvent(category, action, label){
  if(ga){
  ga("send", "event", category, action, label);
  }
}

function handleSignUpClicks(string){
  const eventCategory = "Sign Ups";
  const eventAction = "Clicked Sign Up";
  if(window.location.href.indexOf("breach") > -1){
    sendEvent(eventCategory, eventAction, "Sign up button clicked from featured breach.");
  }
  else if (document.getElementById("what-to-do")) {
    sendEvent(eventCategory, eventAction, "Sign up button clicked after scanning email with breaches.");
  }
  else {
    if(window.location.href.indexOf("scan") > -1){
      sendEvent(eventCategory, eventAction, "Sign up button clicked after scanning email with no breaches.");
    }
    else {
      sendEvent(eventCategory, eventAction, "Sign up button clicked from landing page.");
    }
  }
}

function handleEmailScans(){
  const eventCategory = "Scans";
  const eventAction = "Scanned Email Address";
  if(window.location.href.indexOf("breach") > -1){
    sendEvent(eventCategory, eventAction, "User submitted email from a featured breach.");
  }
  else if(document.getElementById("what-to-do")){
    sendEvent(eventCategory, eventAction, "User submitted additional email.");
  }
  else {
    sendEvent(eventCategory, eventAction, "User submitted email from homepage.");
  }
}

function handlePageViews(){
  const eventCategory = "Scan Results";
  const eventAction = "Viewed Scan Results";
  if(window.location.href.indexOf("scan") > -1){
    if(document.getElementById("what-to-do")){
      sendEvent(eventCategory, eventAction, "Found Breaches");
    } else {
      sendEvent(eventCategory, eventAction, "No Breaches");
    }
  }
}

function isValidEmail(val) {
  // https://stackoverflow.com/a/46181
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(val).toLowerCase());
}

function enableBtnIfEmailValid(e) {
  const emailBtn = document.getElementById("submit-email");
  if (isValidEmail(e.target.value)) {
    emailBtn.disabled = false;
  } else {
    emailBtn.disabled = true;
  }
}

function removeLoader(){
  if(document.getElementsByClassName("input-group-button")[0].classList.contains("loading-data")){
    document.getElementsByClassName("input-group-button")[0].classList.remove("loading-data");
  }
  else {
    return;
  }
}

function displayLoader(){
  document.getElementsByClassName("input-group-button")[0].classList.add("loading-data");
}

function showFalseDoor(){
  handleSignUpClicks();
  const falseDoor = document.getElementById("false-door");
  falseDoor.classList.remove("hidden");
  document.getElementById("close-false-door").onclick = function (){
    falseDoor.classList.add("hidden");
  };
}

async function sha1(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ("00" + b.toString(16)).slice(-2)).join("");
  return hashHex;
}

async function hashEmailAndSend(emailFormSubmitEvent) {
  emailFormSubmitEvent.preventDefault();
  handleEmailScans();
  const emailForm = emailFormSubmitEvent.target;
  for (const emailInput of emailForm.querySelectorAll("input[type=email]")) {
    emailForm.querySelector("input[name=emailHash]").value = await sha1(emailInput.value);
    emailInput.value = "";
  }
  emailForm.submit();
  displayLoader();
}

if(document.querySelector(".email-scan")){
  window.addEventListener("pageshow", removeLoader);
  document.querySelector(".email-scan").addEventListener("submit", hashEmailAndSend);
  document.querySelector(".email-to-hash").addEventListener("input", enableBtnIfEmailValid);
}
window.addEventListener("pageshow", handlePageViews);
document.getElementById("sign-up").addEventListener("click", showFalseDoor);
