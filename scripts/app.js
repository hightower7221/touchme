// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';


  var game = {
    gameon:false,
    gameondisplay:document.querySelector('running'),
    gameontime:20000,
    gametimeout:null,
    totalTime:{},
    pressed:{},
    totalTimeunpressed:{},
    unpressed:{},
    pressednum:0,
    score:0
  };


  var app = {
    isLoading: true,
    debugmode:true,
    user:"",
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    hal9000:document.querySelector('.hal9000'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    statusColors:['green', 'yellow', 'red'],
    uptime:document.querySelector('uptime'),
    downtime:document.querySelector('downtime'),
    keygame: game,
    callback:null

  };


///running:document.querySelector('running'),


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    //app.handleFingerprint();
    app.checkCookie();

  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddCity').addEventListener('click', function() {
    // Add the newly selected city
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    if (!app.selectedCities) {
      app.selectedCities = [];
    }
    app.getForecast(key, label);
    app.selectedCities.push({key: key, label: label});
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });

  document.getElementById('buttouchme').addEventListener('click', function() {
    // Start Action
    //window.confirm("You want to be touched?");

    if (app.keygame.gameon) {
      app.keygame.stopgame();
      app.displaystatus(3);
    }
    else {
      app.keygame.startgame();
    }

  });

  document.addEventListener("keydown", function(e) {
    app.keygame.handlekeytouchdown(e);
  });

  document.addEventListener("touchstart", function(e) {
    app.keygame.handlekeytouchdown(e);
  });

  document.addEventListener("keyup", function(e) {
    app.keygame.handlekeytouchup(e);
  });

  document.addEventListener("touchend", function(e) {
    app.keygame.handlekeytouchup(e);
  });

  /*****************************************************************************
  /* Game first Step */
  /* https://stackoverflow.com/questions/10354902/calculate-how-long-a-key-is-pressed-in-a-keyboard */
  /* Timecalc https://stackoverflow.com/questions/10354902/calculate-how-long-a-key-is-pressed-in-a-keyboard */
  /******************************************************************************/

  app.keygame.handlekeytouchdown = function	(e)
  {
    if(app.keygame.gameon)
    {
      //document.getElementById('buttouchme').style.backgroundColor = "red";
      if (e.which in app.keygame.pressed) return;
      app.keygame.pressed[e.which] = e.timeStamp;
    }
  }

  app.keygame.handlekeytouchup = function	(e)
  {
    if (app.keygame.gameon) {
      //document.getElementById('buttouchme').style.backgroundColor = "green";
      if (!(e.which in app.keygame.pressed)) return;

      var duration = Math.round( e.timeStamp - app.keygame.pressed[e.which] );
      if (!(e.which in app.keygame.totalTime)) app.keygame.totalTime[e.which] = 0;
      app.keygame.totalTime[e.which] += duration;
      downtime.innerHTML =
                  duration + ' ' +
                 '(' + app.keygame.totalTime[e.which] + ' total)';
      delete app.keygame.pressed[e.which];
      app.keygame.calculatestatus(duration,500);
    }

  }


  app.keygame.startgame = function	(){
    app.keygame.gameon = true;
    running.innerHTML = "running";
    app.keygame.gametimeout = setTimeout(app.keygame.stopgame,app.keygame.gameontime);
  }

  app.keygame.stopgame = function	(){
    var downtimeall = 0;
    var uptimeall = 0;
    app.keygame.gameon = false;

    clearTimeout(app.keygame.gametimeout);

    var tTime = app.keygame.totalTime;
    var index;

    for (index in tTime){
      downtimeall += tTime[index];
    }

    uptimeall = app.keygame.gameontime - downtimeall;

    uptime.innerHTML = uptimeall;
    downtime.innerHTML = downtimeall;


    app.keygame.calculatescore(downtimeall,uptimeall,app.keygame.gameontime);
    running.innerHTML = "stopped Score: " + app.keygame.score;


    var url = "https://back-tbackend.a3c1.starter-us-west-1.openshiftapps.com/index.php";
    var params = "game=keygame==score=" + app.keygame.score;

    app.callback = function(){
      alert("Score noted!");
    }
    app.com(url,2,params);

  }


  // calc status
  // 20% yellow
  // 40% red
  app.keygame.calculatestatus = function(value,base) {
    var diffvalue = Math.abs(value - base)
    var diffpecent = diffvalue / base

    app.debug('app.keygame.calculatestatus: ' + value + '#' + base + '#' + diffvalue + '#' + diffpecent);

    if (diffpecent > 0.4)  {app.displaystatus(2);}
    else if (diffpecent > 0.2) {app.displaystatus(1);}
    else { app.displaystatus(0);}
  }

  // calculate score
  app.keygame.calculatescore = function(downtimeall,uptimeall,gameontime) {

    var diffpecent = 0;
    if (downtimeall > uptimeall)
    {
      diffpecent = uptimeall / downtimeall;
    }
    else {
      diffpecent = downtimeall / uptimeall;
    }

    app.keygame.score = Math.round(diffpecent * gameontime);
  }




  // display status

    app.displaystatus = function(value) {
    var statuscolor = "";

    switch(value) {
      case 0:
         statuscolor = "green";
         break;
     case 1:
         statuscolor = "yellow";
         break;
     case 2:
         statuscolor = "red";
         break;
     default:
         statuscolor = "grey";
    }
    document.getElementById('buttouchme').style.backgroundColor = statuscolor;
  }




   app.handleFingerprint = function(){
     var fp = new Fingerprint2().get(function(result, components) {
       app.debug(result); // a hash, representing your device fingerprint
       app.debug(components); // an array of FP components

       var url = "https://back-tbackend.a3c1.starter-us-west-1.openshiftapps.com/index.php";
       //var params = "t=0&fp=" + result + "&fpd=";
       var params = "";
       app.debug(params);
       app.user = result;

       var badfields = ['canvas', 'webgl', 'js_fonts'];
       for (var index in components) {
             var obj = components[index];
             var value = obj.value;
             var key = obj.key;

             if (badfields.indexOf(key)==-1) {
               params = params + key;
               params = params + "=";
               params = params + value;
               params = params + "==";
                app.debug(key + ": " + value);
             }
       }

       app.callback = app.setusercookie;
       app.com(url,0,params);
 })

}

app.setusercookie = function(erg)
{
  app.setCookie("user", app.user, 365);
}




   /*****************************************************************************
    *
    * com Methods
    *
    ****************************************************************************/

    app.com = function(url,t,params){
      app.debug("url: " + url);
      app.debug("type: " + t);
      app.debug("params: " +params);

      // TODO: if no user create one
      //app.user = result;
      url = url + "?t=" + t + "&";
      url = url + "fp=" + app.user + "&";
      url = url + "fpd=" + encodeURI(params);
      app.debug("url: " + url);

      var http = app.createCORSRequest("GET",url);

      //http.open("POST", url, true);
      app.debug("1");

      http.onreadystatechange = function() {//Call a function when the state changes.
          if(http.readyState == 4 && http.status == 200) {

              alert("Respone Ready");
              app.debug(http.responseText);
              app.callback(http.responseText);
          }
      }
    http.send();
  }

   // Create the XHR object.
   app.createCORSRequest = function (method, url) {
     var xhr = new XMLHttpRequest();
     if ("withCredentials" in xhr) {
       // XHR for Chrome/Firefox/Opera/Safari.
       xhr.open(method, url, true);
     } else if (typeof XDomainRequest != "undefined") {
       // XDomainRequest for IE.
       xhr = new XDomainRequest();
       xhr.open(method, url);
     } else {
       // CORS not supported.
       xhr = null;
     }
     return xhr;
   }


   /*****************************************************************************
    *
    * Util Methods
    *
    ****************************************************************************/


   app.debug = function(value){
     if (app.debugmode) {
       console.log(value);
     }

   }

   app.setCookie = function(cname, cvalue, exdays) {
       var d = new Date();
       d.setTime(d.getTime() + (exdays*24*60*60*1000));
       var expires = "expires="+ d.toUTCString();
       app.debug("setCookie: :" + cname + "=" + cvalue);
       document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
   }

   app.getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    app.debug("decodedCookie: " + decodedCookie);
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

app.checkCookie = function() {
  app.debug("checkCookie: ");
    app.user = app.getCookie("user");
    if (app.user != "") {
        alert("Welcome again " + app.user);
    } else {

        app.handleFingerprint();

    }
}

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
/*
  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.toggleLoader = function() {
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

*/




  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getForecast = function(key, label) {
    var statement = 'select * from weather.forecast where woeid=' + key;
    var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' +
        statement;
    // TODO add cache logic here
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.query.results;
            results.key = key;
            results.label = label;
            results.created = json.query.created;
          //  app.updateForecastCard(results);
          });
        }
      });
    }
    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          results.key = key;
          results.label = label;
          results.created = response.query.created;
        //  app.updateForecastCard(results);
        }
      } else {
        // Return the initial weather forecast since no data is available.
      //  app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  // TODO add saveSelectedCities function here
  // Save list of cities to localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = JSON.stringify(app.selectedCities);
    localStorage.selectedCities = selectedCities;
  };

  // TODO uncomment line below to test app with fake data
  // app.updateForecastCard(initialWeatherForecast);

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/

  // TODO add startup code here
 //  app.selectedCities = localStorage.selectedCities;
//  app.toggleLoader();
  /*
  if (app.selectedCities) {
    app.selectedCities = JSON.parse(app.selectedCities);
    app.selectedCities.forEach(function(city) {
      app.getForecast(city.key, city.label);
    });
  } else {
  */
    /* The user is using the app for the first time, or the user has not
     * saved any cities, so show the user some fake data. A real app in this
     * scenario could guess the user's location via IP lookup and then inject
     * that data into the page.
     */
     /*
    app.updateForecastCard(initialWeatherForecast);
    app.selectedCities = [
      {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
    ];
    app.saveSelectedCities();

  }
*/




  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
