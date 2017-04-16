var keyMap;

function htmlEscape(str) {
      return String(str)
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

function yandexTrans(url, resultCallback, errorCallback) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": url,
    "method": "GET",
    "headers": {
      "cache-control": "no-cache"
    }
  }
  $.ajax(settings).done(function (response) {
    var responseText = htmlEscape(response.text[0]);
    responseText = responseText.replace(/[\n]/g,"<BR>");
    resultCallback(responseText);
  });
}

function searchText(selectedText) {
  var key = "trnsl.1.1.20160821T044313Z.8fbdeed9f777bcbc.8bf304d8532c781d6e8f52dc8df4d3f833166087";
  var yandex = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + key+ "&text=" + selectedText + "&lang=" + keyMap[localStorage['voice']];
  yandexTrans(yandex,
  function(resultCallback) {
    finalText = resultCallback;	//after from yandex
    //call function inside result callback
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {sendback: finalText}, function(response) {});
    });
  },
  function(errorMessage) {
    renderStatus('Cannot translate: ' + errorMessage);
  });
}
var lastUtterance = '';
var speaking = false;
var globalUtteranceIndex = 0;

function closetts() {
  chrome.tts.stop();
}

function speak(utterance) {
  if (speaking && utterance == lastUtterance) {
    chrome.tts.stop();
    return;
  }

  speaking = true;
  lastUtterance = utterance;
  globalUtteranceIndex++;
  var utteranceIndex = globalUtteranceIndex;

  var rate = localStorage['rate'] || 1.0;
  var pitch = localStorage['pitch'] || 1.0;
  var volume = localStorage['volume'] || 1.0;
  var genderSelected = localStorage['gender'] || 'female';
  var voice = localStorage['voice'];

  chrome.tts.speak(
      utterance,
      {voiceName: voice,
       gender: genderSelected,
       rate: parseFloat(rate),
       pitch: parseFloat(pitch),
       volume: parseFloat(volume),
       onEvent: function(evt) {
         if (evt.type == 'end' ||
             evt.type == 'interrupted' ||
             evt.type == 'cancelled' ||
             evt.type == 'error') {
           if (utteranceIndex == globalUtteranceIndex) {
             speaking = false;
           }
         }
       }
      });
}

function sendOpenPopup(selectedText) {
  // var returnText = selectedText; //do actual translations though...
  searchText(selectedText);
}

function initBackground() {
  keyMap = {
  'native': 'en',
  'Google Deutsch': 'de',
  'Google US English': 'en',
  'Google UK English Female': 'en',
  'Google UK English Male': 'en',
  'Google español': 'es',
  'Google español de Estados Unidos': 'es',
  'Google français': 'fr',
  'Google हिन्दी': 'hi',
  'Google Bahasa Indonesia': 'id',
  'Google italiano': 'it',
  'Google 日本語': 'ja',
  'Google 한국의': 'ko',
  'Google Nederlands': 'nl',
  'Google polski': 'pl',
  'Google português do Brasil': 'pt',
  'Google русский': 'ru',
  'Google 普通话（中国大陆）': 'zh',
  'Google 粤語（香港）': 'zh',
  'Google 國語（臺灣）': 'zh',
};
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request['getSwitch']) {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
              chrome.tabs.sendMessage(tabs[0].id, {switchback: localStorage['switch']}, function(response) {});
          });
        } else if (localStorage["switch"] == 'Off') {
          return;
        }else if (request['showPopup']) {
          sendOpenPopup(request['showPopup']);
        } else if (request['speakWords']) {
          speak(request['speakWords']);
        } else if (request['closetts']) {
          closetts();
        }
      });

}

initBackground();
