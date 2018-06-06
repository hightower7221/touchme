
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
    //url: "https://back-tbackend.a3c1.starter-us-west-1.openshiftapps.com/index.php",
    url: "https://back-back.a3c1.starter-us-west-1.openshiftapps.com/index.php",
    visibleCards: {},
    //selectedCities: [],
    spinner: document.querySelector('.loader'),
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

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    app.checkCookie();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Ask for new Job
    app.handleJob();
  });

/*
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
*/
/*
  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });
*/
  document.getElementById('buttouchme').addEventListener('click', function() {
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
    app.keygame.score = 0;
    uptime.innerHTML = "0";
    downtime.innerHTML = "0";
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

    var params = "game=keygame==score=" + app.keygame.score;

    app.callback = function(){
      alert("Score noted!");
    }
    app.com(app.url,2,params);

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


  /*********************************************************************************
        handle fingerprint
  ***********************************************************************************/

   app.handleFingerprint = function(){
     var fp = new Fingerprint2().get(function(result, components) {
       app.debug(result); // a hash, representing your device fingerprint
       app.debug(components); // an array of FP components

       var params = "";
       app.debug(params);
       app.user = result;

       var badfields = ['canvas', 'webgl', 'js_fonts'];
       for (var index in components) {
             var obj = components[index];
             var value = obj.value;
             var key = obj.key;

             if(key&&value){
               if (badfields.indexOf(key)==-1) {
                 if (params!="") {
                   params = params + "==";
                 }
                 params = params + key;
                 params = params + "=";
                 params = params + value;
                 app.debug(key + ": " + value);
               }
             }
       }

       app.callback = app.setusercookie;
       app.com(app.url,2,params);
     })

   }

  app.setusercookie = function(erg)
  {
    app.setCookie("user", app.user, 365);
  }


  /*********************************************************************************
  *
  *      handle Job
  *       set callback
  *       start communication
  *
  ***********************************************************************************/

   app.handleJob = function(){
      var params = "";
      app.debug(params);
      app.callback = app.executeJob;
      app.com(app.url,1,params);
   }


   /*********************************************************************************
   *
   *      handle Job Request answer
   *       split responseText
   *       start communication
   *
   ***********************************************************************************/
   app.executeJob = function (JobRequestResponse) {
     alert(JobRequestResponse);

     if(JobRequestResponse)
     {
        var jobarray = JobRequestResponse.split(";");
        app.debug(jobarray);

        var job_id = String(jobarray[0]).trim();
        var job_type = String(jobarray[1]).trim();
        // split content
        var job_content = JSON.parse(jobarray[4]);


        var touchme_div = null;
        var card_div = app.createdisplayelment("div","card",job_id);



        if (job_type=="0"||job_type=="1") {
          touchme_div = app.createdisplayelment("div","touchmecell","");
          touchme_div.appendChild(document.createTextNode(job_content.text));
          card_div.appendChild(touchme_div);

        }


        switch (job_type) {
          // display text
          case "0":
            app.debug("Job type 0");

          // question 2 options i.e. yes / no
          case "1":
            app.debug("Job type 1");

            // determine num of options
            var count = 0;

            while (job_content["option" + (count+1)]!=undefined||job_content["option" + (count + 1) + "img"]!=undefined) {
              count = count + 1;
            }
            app.debug("num of options: " + count);

            // display elements
            for (var i = 1; i <= count; i++) {
              var optionElm = app.createOptionElement(String(i),job_content,job_id,job_type);
              card_div.appendChild(optionElm);
            }

            // set timeout for jobelrmrnt
            if (job_content.timeout > 0) {
              setTimeout(function(){
                var Job_Element = document.getElementById(job_id);
                Job_Element.style.display = "none"; }, job_content.timeout);
            }
            break;
            // display text
          case "3":
            app.debug("Job type 3 touch game");
            document.getElementById("touchgame").style.visibility = "visible";
            break;
        }
        document.getElementById("main").appendChild(card_div);
     }
     else {
       app.debug(" No job for now ");
     }

   }

   /*********************************************************************************
   *
   *      create one option element
   *       text button or image button
   *
   ***********************************************************************************/
   app.createOptionElement = function(option,job_content,job_id,job_type){

     //option div
     var optinid = "option"+ option;
     var ergElement = app.createdisplayelment("div","touchmecell",optinid);

     var OptionText = job_content[optinid];
     var OptionImg = job_content[optinid + "img"];


     var ergDisplayElement = null;


     // display a text button
     if (OptionText!=""&&OptionText!=undefined)
     {
       ergDisplayElement = document.createElement("BUTTON");
       ergDisplayElement.appendChild(document.createTextNode(OptionText));
     }
     else {
       // display a image button
       if (job_content.OptionImg!=""&&job_content.OptionImg!=undefined) {
         ergDisplayElement = document.createElement('img');
         ergDisplayElement.src = OptionImg;
         ergDisplayElement.setAttribute('width', '200px');
       }
     }

     ergDisplayElement.addEventListener('click', function(){app.storeOptionDecition(job_id,job_type,option);},false);

     ergElement.appendChild(ergDisplayElement);
     return ergElement;
   }




   // store decicion
   app.storeOptionDecition = function(id,type,value){
     var params = "job_id=" + id + "==job_type=" + type + "==option=" + value;

     app.callback = function(){
       alert("Noted!");
     }
     app.com(app.url,3,params);

     // TODO: Kill Job display

   }

   app.destroyelment =function(selector) {
       var obj = document.getElementById("selector");

   }




   app.createdisplayelment = function(elmenttype,styleclass,id){
     var para = document.createElement(elmenttype);
     var att = document.createAttribute("class");       // Create a "class" attribute
     att.value = styleclass;
     para.setAttributeNode(att);

     if (id) {
       att = document.createAttribute("id");       // Create a "class" attribute
       att.value = id;
       para.setAttributeNode(att);
     }

     return para;
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

      http.onreadystatechange = function() {
          if(http.readyState == 4 && http.status == 200) {
            if (app.debugmode) {
              alert("Respone Ready");
            }
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
       xhr.open(method, url, true);
     } else if (typeof XDomainRequest != "undefined") {
       xhr = new XDomainRequest();
       xhr.open(method, url);
     } else {
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
        if (app.debugmode) {
          alert("Welcome again " + app.user);
        }
      } else {

          app.handleFingerprint();

      }
  }



  /************************************************************************
   *
   * Code required to start the app
   *
   ************************************************************************/

  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
  app.checkCookie();
})();
