  function renderStatus(statusText) {
    document.getElementById('status').textContent = statusText;
  }

  function switchVoice() {
    if (localStorage['gender'] == 'male') {
      localStorage['gender'] = 'female';
      document.getElementById("voiceswitchtoggle").innerHTML = 'female';
    } else {
      localStorage['gender'] = 'male';
      document.getElementById("voiceswitchtoggle").innerHTML = 'male';
    }
  }

  function switchButton() {
    if (localStorage['switch'] == 'On') {
      localStorage['switch'] = 'Off';
      document.getElementById("onoffswitchtoggle").innerHTML = 'Off';
      document.getElementById("voiceswitchtoggle").disabled = true;
      document.getElementById("voiceChromeTranslator").disabled = true;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {toggle: 'Off'}, function(response) {});
      });
    } else if (localStorage['switch'] == 'Off') {
      localStorage['switch'] = 'On';
      document.getElementById("onoffswitchtoggle").innerHTML = 'On';
      document.getElementById("voiceswitchtoggle").disabled = false;
      document.getElementById("voiceChromeTranslator").disabled = false;

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {toggle: 'On'}, function(response) {});
      });
    } else {
      localStorage['switch'] = 'Off';
      document.getElementById("onoffswitchtoggle").innerHTML = 'Off';
      document.getElementById("voiceswitchtoggle").disabled = true;
      document.getElementById("voiceChromeTranslator").disabled = true;
    }
  }

  function getVoiceLang() {
  var voice = document.getElementById('voiceChromeTranslator');
  var voiceArray = [];
  chrome.tts.getVoices(function(va) {
    voiceArray = va;
    for (var i = 0; i < voiceArray.length; i++) {
      var opt = document.createElement('option');
      var name = voiceArray[i].voiceName;
      if (name == localStorage['voice']) {
        opt.setAttribute('selected', '');
      }
      opt.setAttribute('value', name);
      opt.innerText = voiceArray[i].voiceName;
      voice.appendChild(opt);
    }
  });
  voice.addEventListener('change', function() {
    var i = voice.selectedIndex;
    localStorage['voice'] = voiceArray[i].voiceName;
    console.log(localStorage['voice']);
  }, false);
}

function loadListeners() {
  document.getElementById("onoffswitchtoggle").innerHTML = localStorage["switch"] || 'Off';
  localStorage["switch"] = localStorage["switch"] || 'Off';
  console.log(localStorage["switch"]);
  document.getElementById("voiceswitchtoggle").innerHTML = localStorage["gender"] || 'female';
  localStorage["gender"] = localStorage["gender"] || 'female';
  if (localStorage["switch"] == 'Off') {
    document.getElementById("voiceswitchtoggle").disabled = true;
    document.getElementById("voiceChromeTranslator").disabled = true;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {toggle: localStorage["switch"]}, function(response) {});
    });
  } else if (localStorage["switch"] == 'On') {
    document.getElementById("voiceswitchtoggle").disabled = false;
    document.getElementById("voiceChromeTranslator").disabled = false;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {toggle: 'Off'}, function(response) {});
    });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {toggle: localStorage["switch"]}, function(response) {});
    });
  }
  else {
    console.log('here');
    document.getElementById("voiceswitchtoggle").disabled = true;
    document.getElementById("voiceChromeTranslator").disabled = true;
    localStorage["switch"] = 'Off';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {toggle: 'Off'}, function(response) {});
    });
  }
  document.getElementById("onoffswitchtoggle").addEventListener('click', switchButton);
  document.getElementById("voiceswitchtoggle").addEventListener('click', switchVoice);
  getVoiceLang();
}

document.addEventListener('DOMContentLoaded', loadListeners);
