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
    gameontime:60000,
    gametimeout:null,
    totalTime:{},
    pressed:{},
    totalTimeunpressed:{},
    unpressed:{},
    pressednum:0
  };


  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    hal9000:document.querySelector('.hal9000'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    statusColors:['green', 'yellow', 'red'],
    downtime:document.querySelector('downtime'),
    keygame: game
  };


///running:document.querySelector('running'),


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
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
      /*
      running.innerHTML = "0";
      */
      app.displaystatus(3);
    }
    else {

      app.keygame.startgame();
      /*9
      app.keygame.gameon = true;
      running.innerHTML = "1";
      app.displaystatus(0);
      app.keygame.gametimeout = setTimeout(app.keygame.stopgame,app.keygame. gameontime);
      */
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
    app.keygame.gameondisplay.innerHTML = "running";
    app.keygame.gametimeout = setTimeout(app.keygame.stopgame,app.keygame. gameontime);
  }

  app.keygame.stopgame = function	(){
    app.keygame.gameon = false;
    app.keygame.gameondisplay.innerHTML = "stopped";
    clearTimeout(app.keygame.gametimeout);
  }


  // calc status
  // 20% yellow
  // 40% red
  app.keygame.calculatestatus = function(value,base) {
    var diffvalue = Math.abs(value - base)
    var diffpecent = diffvalue / base

    console.log('app.keygame.calculatestatus: ' + value + '#' + base + '#' + diffvalue + '#' + diffpecent);

    if (diffpecent > 0.4)  {app.displaystatus(2);}
    else if (diffpecent > 0.2) {app.displaystatus(1);}
    else { app.displaystatus(0);}
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
/*
  app.getIconClass = function(weatherCode) {
    // Weather codes: https://developer.yahoo.com/weather/documentation.html#codes
    weatherCode = parseInt(weatherCode);
    switch (weatherCode) {
      case 25: // cold
      case 32: // sunny
      case 33: // fair (night)
      case 34: // fair (day)
      case 36: // hot
      case 3200: // not available
        return 'clear-day';
      case 0: // tornado
      case 1: // tropical storm
      case 2: // hurricane
      case 6: // mixed rain and sleet
      case 8: // freezing drizzle
      case 9: // drizzle
      case 10: // freezing rain
      case 11: // showers
      case 12: // showers
      case 17: // hail
      case 35: // mixed rain and hail
      case 40: // scattered showers
        return 'rain';
      case 3: // severe thunderstorms
      case 4: // thunderstorms
      case 37: // isolated thunderstorms
      case 38: // scattered thunderstorms
      case 39: // scattered thunderstorms (not a typo)
      case 45: // thundershowers
      case 47: // isolated thundershowers
        return 'thunderstorms';
      case 5: // mixed rain and snow
      case 7: // mixed snow and sleet
      case 13: // snow flurries
      case 14: // light snow showers
      case 16: // snow
      case 18: // sleet
      case 41: // heavy snow
      case 42: // scattered snow showers
      case 43: // heavy snow
      case 46: // snow showers
        return 'snow';
      case 15: // blowing snow
      case 19: // dust
      case 20: // foggy
      case 21: // haze
      case 22: // smoky
        return 'fog';
      case 24: // windy
      case 23: // blustery
        return 'windy';
      case 26: // cloudy
      case 27: // mostly cloudy (night)
      case 28: // mostly cloudy (day)
      case 31: // clear (night)
        return 'cloudy';
      case 29: // partly cloudy (night)
      case 30: // partly cloudy (day)
      case 44: // partly cloudy
        return 'partly-cloudy-day';
    }
  };
*/
  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */

   /*
  var initialWeatherForecast = {
    key: '2459115',
    label: 'New York, NY',
    created: '2016-07-22T01:00:00Z',
    channel: {
      astronomy: {
        sunrise: "5:43 am",
        sunset: "8:21 pm"
      },
      item: {
        condition: {
          text: "Windy",
          date: "Thu, 21 Jul 2016 09:00 PM EDT",
          temp: 56,
          code: 24
        },
        forecast: [
          {code: 44, high: 86, low: 70},
          {code: 44, high: 94, low: 73},
          {code: 4, high: 95, low: 78},
          {code: 24, high: 75, low: 89},
          {code: 24, high: 89, low: 77},
          {code: 44, high: 92, low: 79},
          {code: 44, high: 89, low: 77}
        ]
      },
      atmosphere: {
        humidity: 56
      },
      wind: {
        speed: 25,
        direction: 195
      }
    }
  };
  */
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
