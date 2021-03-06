
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



//https://back-back.a3c1.starter-us-west-1.openshiftapps.com/index.php



  var app = {
      isLoading:true,
      debugmode:false,
      user:"",
      system:"",
      url: "https://back-backend.a3c1.starter-us-west-1.openshiftapps.com/index.php",
      visibleCards: {},
      job_id:"",
      spinner: document.querySelector('.loader'),
      cardTemplate: document.querySelector('.cardTemplate'),
      container: document.querySelector('.main'),
      addDialog: document.querySelector('.dialog-container'),
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      statusColors:['green', 'yellow', 'red'],
      uptime:document.querySelector('uptime'),
      downtime:document.querySelector('downtime'),
      keygame: game,
      callback:null,
      jobtimer:null,
      loadjob:true
  };

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/







  document.getElementById('buttouchme').addEventListener('click', function() {
    if (app.keygame.gameon) {
      app.keygame.stopgame();
      app.displaystatus(3);
    }
    else {
      app.keygame.startgame();
    }
  });


  app.initbuttons = function(){
      document.getElementById('butRefresh').addEventListener('click', function() {
        app.updateApp();
      });

      document.getElementById('butAdd').addEventListener('click', function() {
        // Ask for new Job
        //  app.handleJob();
        document.getElementById("touchgame").style.display = "block";

        document.getElementById('close_game').addEventListener('click', function() {
          app.storeOptionDecition("touchgame",3,-1,false);
        });
      });
  }

  app.remove = function(cacheName, url) {
  return window.caches.open(cacheName).then(function(cache) {
    return cache.delete(url);
  });
}

  /*****************************************************************************
  /* Game first Step */
  /* https://stackoverflow.com/questions/10354902/calculate-how-long-a-key-is-pressed-in-a-keyboard */
  /* Timecalc https://stackoverflow.com/questions/10354902/calculate-how-long-a-key-is-pressed-in-a-keyboard */
  /****************************************************************************/

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
      if (!(e.which in app.keygame.totalTime)) {
          app.keygame.totalTime[e.which] = 0;
      }
      app.keygame.totalTime[e.which] += duration;
      downtime.innerHTML = duration + ' ' +
                 '(' + app.keygame.totalTime[e.which] + ' total)';
      delete app.keygame.pressed[e.which];
      app.keygame.calculatestatus(duration,500);
    }
  }

  app.keygame.displaygame = function	(){
    document.getElementById("touchgame").style.display = "block";
    document.getElementById('close_game').addEventListener('click', function() {
      app.storeOptionDecition("touchgame",3,-1,false);
    });
  }

  app.keygame.startgame = function	(){
    app.keygame.gameon = true;
    app.keygame.score = 0;
    uptime.innerHTML = "0";
    downtime.innerHTML = "0";

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

    document.addEventListener("touchend", function(e) {
      app.keygame.handlekeytouchup(e);
    });

    running.innerHTML = "running";
    app.keygame.gametimeout = setTimeout(app.keygame.stopgame,20);
  }

  app.keygame.stopgame = function	(){
    var downtimeall = 0;
    var uptimeall = 0;
    app.keygame.gameon = false;

    clearTimeout(app.keygame.gametimeout);

    document.removeEventListener("keydown", function(e) {
      app.keygame.handlekeytouchdown(e);
    });

    document.removeEventListener("touchstart", function(e) {
      app.keygame.handlekeytouchdown(e);
    });

    document.removeEventListener("keyup", function(e) {
      app.keygame.handlekeytouchup(e);
    });

    document.removeEventListener("touchend", function(e) {
      app.keygame.handlekeytouchup(e);
    });

    document.removeEventListener("touchend", function(e) {
      app.keygame.handlekeytouchup(e);
    });

    document.removeEventListener("close_game", function(e) {
      app.storeOptionDecition("touchgame",3,-1,false);
    });


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


    //var params = "game=keygame==score=" + app.keygame.score;
    var params = "{\"game\":\"keygame\",\"score\":\"" + app.keygame.score + "\"}";

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

    app.debug('app.keygame.calculatestatus: ' + value + '#' + base
      + '#' + diffvalue + '#' + diffpecent);

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
        let statuscolor = "";

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
  *      handle fingerprint
  *****************************************************************************/

   app.handleFingerprint = function(){

     /*
           excludeCanvas: true,excludeWebGL: true,excludeJsFonts: true
     */
     var options = {excludeCanvas: true,excludeWebGL: true,excludeJsFonts: true}
     var fp = new Fingerprint2(options).get(function(result, components) {
       app.debug(result); // a hash, representing your device fingerprint
       app.debug(components); // an array of FP components

       var params = "";

       app.user = prompt("Your pin", "");
       app.system = result;
       var params = JSON.stringify(components);

       app.debug("#######################################################");
       app.debug(params);
       app.debug("#######################################################");



       app.setusercookie();
       app.callback = app.setusercookie;
       app.com(app.url,2,params);

        // TODO: Handle no User PIN
        if (app.user==""||app.user==null) {

          //delete reload BUTTON
          app.removeElment("butRefresh","header");

          //delete add BUTTON
          app.removeElment("butAdd","header");

          //delete game
          app.removeElment("touchgame","main");

          var card_div = app.createdisplayelment("div","card",0);

          app.displayfunpic(card_div);

          card_div.addEventListener('click', function() {
            app.displayfunpic(card_div);
          });

          document.getElementById("main").appendChild(card_div);
        }
        else {
            app.initbuttons();
            document.getElementById('main').style.backgroundImage = "url('images/grid.jpg')";
            document.getElementById("main").style.backgroundSize = "cover";

        }
     })
   }

  app.displayfunpic = function(card_div) {
    var funpics = ["gqgAigX","DFN5z6A","xNvbHEf","Vi9WROY","CgU8vj5","vSe1hne",
                    "cRBjZDy","USuPv9Z","X6MIG6e","Mzwu3dI","86UwETP","MxFN0gn",
                    "9UsJWz5","ve5g6fU","MR63t40","QqlcC34"];

    var funpics_num = funpics.length;
    var imgnum = Math.floor((Math.random() * funpics_num) + 1)-1;

    var picurl = "<img src=\"https://i.imgur.com/" + funpics[imgnum]
                  + ".jpg\" height=\"200\" width=\"200\">";

    card_div.style.display = "block";
    card_div.innerHTML = picurl;
  };

  app.setusercookie = function(erg)
  {
    // TODO: check erg param for errors
    app.setCookie("user", app.user, 365);
    app.setCookie("system", app.system, 365);
  }


  /*****************************************************************************
  *
  *      handle Job
  *       set callback
  *       start communication
  *
  *****************************************************************************/

   app.handleJob = function(){
      var params = "";

      if (app.loadjob) {
        app.loadjob = false;
        if(app.job_id!="")
        {
          params = "{\"oldjob\":\"" + app.job_id + "\"}";
        }
        app.debug(params);
        app.callback = app.executeJob;
        app.com(app.url,1,params);
      } else {
          app.debug("waiting for last job done");
      }


   }


   /****************************************************************************
   *
   *      handle Job Request answer
   *       split responseText
   *       start communication
   *
   ****************************************************************************/
   app.executeJob = function (JobRequestResponse) {
     //alert(JobRequestResponse);

     if(JobRequestResponse)
     {
        var jobarray = JobRequestResponse.split(";");
        if (jobarray.length > 1) {




        app.debug("jobarray: " + jobarray);

        var job_id = String(jobarray[0]).trim();
        var job_type = String(jobarray[1]).trim();
        // split content
        var job_content = JSON.parse(jobarray[4]);

        // every job one time
        app.debug("every job one time " + app.job_id + ":" + job_id);

        if(app.job_id.localeCompare(job_id)!=0)
        {
          app.job_id = job_id;

          var touchme_div = null;
          var card_div = app.createdisplayelment("div","card",job_id);
          var close_button = app.createdisplayelment("button","close"
                                                    ,"close_" + job_id);

          if (job_type=="0"||job_type=="1") {
            touchme_div = app.createdisplayelment("div","touchmecell","");
            touchme_div.innerHTML = job_content.text;
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

              let goon = job_content["option" + (count + 1)]!=undefined;
              goon = goon ||job_content["option" + (count + 1) + "img"]!=undefined;

              while (goon) {
                count = count + 1;
                goon = job_content["option" + (count + 1)]!=undefined;
                goon = goon ||job_content["option" + (count + 1) + "img"]!=undefined;
              }
              app.debug("num of options: " + count);

              // display elements
              for (var i = 1; i <= count; i++) {
                var optionElm = app.createOptionElement(String(i),job_content
                                                        ,job_id,job_type);
                card_div.appendChild(optionElm);
              }

              // set timeout for job element
              if (job_content.timeout > 0) {
                setTimeout(function(){
                  var Job_Element = document.getElementById(job_id);
                  if(Job_Element.style!=null)
                  {Job_Element.style.display = "none";}
                }, job_content.timeout * 1000);
              }

              close_button.innerHTML = "X";

              close_button.onclick = function(){
                  app.storeOptionDecition(job_id,job_type,-1,false);
                };

              card_div.appendChild(close_button);
              card_div.style.display = "inline-block";
              document.getElementById("main").appendChild(card_div);
              break;

            // display touch game
            case "3":
              app.debug("Job type 3 touch game");
              app.keygame.displaygame();
              break;

            // reload
            case "4":
                app.debug("Job type 4 reload");
                app.updateApp();
                break;
            case "5":
              app.debug("Job type 5 modify jobreload interval");

              var jobinterval = 0;

              if (job_content["interval"] !=undefined ) {
                app.debug("new job interval");
// TODO: Wert verifizieren
// Wenn wert nix standard 120 sekunden + Fehler loggen
                jobinterval = job_content["interval"];

                if(app.jobtimer)
                {
                  clearInterval(app.jobtimer);
                  app.jobtimer = null;
                }
                app.jobtimer = setInterval(app.handleJob, jobinterval);
              }

              // Stop Jobtimer
              if (job_content["stop"] !=undefined ) {
                app.debug("stop job timer");
                clearInterval(app.jobtimer);
                app.jobtimer = null;
              }

              // Start jobtimer
              if (job_content["start"] !=undefined ) {
                app.debug("start Job timer");
                app.jobtimer = setInterval(app.handleJob, 120000);
              }
              break;

           case "6":
              app.debug("Job type 6 change buttons");

              var buttonname = job_content["button"];
              var buttonfunctionname = job_content["function"];

              var error_message = "";

              if (buttonname !=undefined&&buttonname !=nulld&&buttonname !="") {
                if (buttonfunctionname !=undefined&&buttonfunctionname !=nulld&&buttonfunctionname !="") {

                    var buttonfunction = null;

                    switch (buttonfunctionname) {
                      case "updateApp":
                        buttonfunction = app.updateApp();
                        break;
                      case "handleJob":
                        buttonfunction = app.handleJob();
                        break;

                    }

// TODO: alte listener löschen
                    //document.getElementById(buttonname).
                    document.getElementById(buttonname).addEventListener('click', buttonfunction);
                }
                else {
                    error_message = "no buttonfunctionname";
                }
              }
              else {
                  error_message = "no buttonname";
              }

              if (error_message!="") {
                app.debug("[ERROR] executeJob:jobtype 6: id " + job_id + ":" + error_message);
                var params = "{\"job_id\":\"" + job_id
                            + "\",\"job_type\":\"6\",\"error_message\":\""
                            + value + "\"}";

                app.com(app.url,3,params);
              }



              document.getElementById('butRefresh').addEventListener('click', function() {
                //app.checkCookie();
                app.updateApp();
              });

              document.getElementById('butAdd').addEventListener('click', function() {
                // Ask for new Job
                //  app.handleJob();
                document.getElementById("touchgame").style.display = "block";

                document.getElementById('close_game').addEventListener('click', function() {
                  app.storeOptionDecition("touchgame",3,-1,false);
                });
                // TODO: DO WE NEED THIS?
                //app.remove("touchme-final-1","/touchme/scripts/app.js")
              });

              break;
          }
        }
        else {
          app.debug(" Old job for now ");
        }

     }
     else {
       app.debug(" No job for now ");
     }
}
     else {
       app.debug(" No job for now ");
     }
     app.loadjob = true;
   }

   /****************************************************************************
   *
   *      create one option element
   *       text button or image button
   *
   ****************************************************************************/
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
       if (OptionImg!=""&&OptionImg!=undefined) {
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
   app.storeOptionDecition = function(id,type,value, showresponse=true){
   var params = "{\"job_id\":\"" + id + "\",\"job_type\":\"" + type
                + "\",\"option\":\"" + value + "\"}";

   app.callback = function(){
   if (showresponse)
   {
        alert("Noted!");
    }
     app.removeElment(id);
     }
     app.com(app.url,3,params);
   }

   app.removeElment = function(selector,topelement = "main") {
       var Main_Element = document.getElementById(topelement);
       Main_Element.removeChild(document.getElementById(selector));
   }




   app.createdisplayelment = function(elmenttype,styleclass,id){
     var para = document.createElement(elmenttype);
     var att = document.createAttribute("class");
     att.value = styleclass;
     para.setAttributeNode(att);

     if (id) {
       att = document.createAttribute("id");
       att.value = id;
       para.setAttributeNode(att);
     }

     return para;
}



   /****************************************************************************
    *
    * com Methods
    *
    ***************************************************************************/

    app.com = function(url,t,params){
      var isGet = false;

      app.debug("url: " + url);
      app.debug("type: " + t);
      app.debug("params: " + params);

      var sendparam = "t=" + t + "&";
      sendparam = sendparam + "s=" + app.system + "&";
      sendparam = sendparam + "u=" + app.user + "&";
      sendparam = sendparam + "c=" + encodeURI(params);

      if (isGet)
      {
        url = url + "?" + sendparam;
      }


      /*
      url = url + "?t=" + t + "&";
      url = url + "s=" + app.system + "&";
      url = url + "u=" + app.user + "&";
      url = url + "c=" + encodeURI(params);
      app.debug("url: " + url);
*/




      var sendmode = "GET";
      if (isGet==false){
        sendmode = "Post";
      }

//var http = app.createCORSRequest("GET",url);
      var http = app.createCORSRequest(sendmode,url);

      http.onreadystatechange = function() {
          if(http.readyState == 4 && http.status == 200) {
            if (app.debugmode) {
              //alert("Respone Ready");
              app.debug(http.responseText);
            }

            app.callback(http.responseText);
          }
      }

      if (isGet)
      {
          http.send();
      }
      else{
          http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          http.send(sendparam);
      }

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

   /****************************************************************************
    *
    * Update App
    *
    ***************************************************************************/
    app.updateApp = function(){
      // info to serviceworker
      // https://github.com/jbmoelker/serviceworker-introduction/issues/1

      if ('serviceWorker' in navigator) {
        //navigator.serviceWorker.controller.postMessage({'message':'clearCache'});
        navigator.serviceWorker.controller.postMessage('clearCache');
        window.setTimeout(function(){
          // reload page from server
          location.reload(true);
        },10000);
      }
      else {
          app.debug("[ERROR] [app.updateApp] No Serviceworker found!" );
      }
    }

   /****************************************************************************
    *
    * Util Methods
    *
    ***************************************************************************/
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
      app.system = app.getCookie("system");
      if (app.user != ""&&app.user !=null) {
        if (app.debugmode) {
          alert("Welcome again " + app.user + " : ");
        }
        document.getElementById('main').style.backgroundImage = "url('images/grid.jpg')";
        document.getElementById("main").style.backgroundSize = "cover";
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

  if(app.user !=null&&app.user !="")
  {
      app.jobtimer = setInterval(app.handleJob, 60000);
      app.handleJob();
  }
})();
