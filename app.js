(function () {
  function xhrJson(url, cb) {
    var r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.onreadystatechange = function () {
      if (r.readyState === 4) {
        if (r.status >= 200 && r.status < 300) {
          try { cb(null, JSON.parse(r.responseText)); }
          catch (e) { cb(e); }
        } else {
          cb(new Error("HTTP " + r.status + " " + url));
        }
      }
    };
    r.send(null);
  }

  function pad2(n){ return (n<10?"0":"")+n; }

  function formatTime(d){
    var h=d.getHours(), m=d.getMinutes();
    var ap=(h>=12)?"PM":"AM";
    h=h%12; if(h===0) h=12;
    return h+":"+pad2(m)+" "+ap;
  }

  function formatLongDate(d){
    var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    return days[d.getDay()]+", "+months[d.getMonth()]+" "+d.getDate();
  }

  function parseWhen(str){
    var p=str.split(" ");
    var ymd=p[0].split("-");
    var hm=(p[1]||"00:00").split(":");
    return new Date(+ymd[0], +ymd[1]-1, +ymd[2], +hm[0], +hm[1], 0, 0);
  }

  function esc(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function wxIconFor(code){
    if (code === 0) return "â˜€";
    if (code === 1 || code === 2) return "â›…";
    if (code === 3) return "â˜";
    if (code === 45 || code === 48) return "ðŸŒ«";
    if (code >= 51 && code <= 67) return "ðŸŒ§";
    if (code >= 71 && code <= 77) return "ðŸŒ¨";
    if (code >= 80 && code <= 82) return "ðŸŒ¦";
    if (code >= 95) return "â›ˆ";
    return "â˜";
  }

  function wxTextFor(code){
    if (code === 0) return "Clear";
    if (code === 1) return "Mostly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Cloudy";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunder";
    return "Clouds";
  }

  function tick(){
    var now=new Date();
    document.getElementById("time").textContent = formatTime(now);
    document.getElementById("date").textContent = formatLongDate(now);
    document.getElementById("leftTime").textContent = formatTime(now);
    document.getElementById("leftDate").textContent = formatLongDate(now);
  }

  function buildCalendar(now){
    var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    var y=now.getFullYear(), m=now.getMonth();
    var first=new Date(y,m,1);
    var startDow=first.getDay();
    var daysInMonth=new Date(y,m+1,0).getDate();

    document.getElementById("calTitle").textContent = months[m]+" "+y;

    var grid=document.getElementById("calGrid");
    var html="";
    var dows=["S","M","T","W","T","F","S"];
    for(var i=0;i<7;i++) html+='<div class="calDow">'+dows[i]+'</div>';
    for(var b=0;b<startDow;b++) html+='<div class="calCell blank">0</div>';

    for(var day=1; day<=daysInMonth; day++){
      var cls="calCell"+(day===now.getDate()?" today":"");
      html+='<div class="'+cls+'">'+day+'</div>';
    }
    grid.innerHTML = html;
  }

  function loadEvents(cfg){
    xhrJson("events.json?ts="+Date.now(), function(err, list){
      var wrap=document.getElementById("eventsList");
      var max=(cfg && cfg.maxEvents) ? cfg.maxEvents : 3;

      if(err){
        wrap.innerHTML = '<div class="eventRow"><div class="eventTitle">Events</div><div class="eventWhen">Load error</div></div>';
        return;
      }

      var now=new Date();
      var ev=(list||[]).map(function(e){
        return { title: e.title||"Event", when: parseWhen(e.when||"2099-01-01 00:00") };
      }).sort(function(a,b){ return a.when-b.when; });

      var upcoming=[];
      for(var i=0;i<ev.length;i++){
        if(ev[i].when >= now) upcoming.push(ev[i]);
        if(upcoming.length>=max) break;
      }

      if(!upcoming.length){
        wrap.innerHTML = '<div class="eventRow"><div class="eventTitle">No upcoming events</div><div class="eventWhen">â€”</div></div>';
        return;
      }

      var html="";
      for(var j=0;j<upcoming.length;j++){
        html += '<div class="eventRow">';
        html +=   '<div class="eventTitle">'+esc(upcoming[j].title)+'</div>';
        html +=   '<div class="eventWhen">'+formatTime(upcoming[j].when)+'</div>';
        html += '</div>';
      }
      wrap.innerHTML = html;
    });
  }

  function loadWeather(cfg){
    var lat=cfg.lat, lon=cfg.lon;
    var days=cfg.forecastDays || 10;

    var url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + encodeURIComponent(lat) +
      "&longitude=" + encodeURIComponent(lon) +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&temperature_unit=" + encodeURIComponent(cfg.units === "celsius" ? "celsius" : "fahrenheit") +
      "&wind_speed_unit=mph" +
      "&timezone=auto" +
      "&forecast_days=" + encodeURIComponent(days);

    xhrJson(url, function(err, data){
      if(err || !data || !data.current){
        document.getElementById("wxMain").textContent = "Weather unavailable";
        return;
      }

      var cur=data.current;
      var code=cur.weather_code;
      var temp=Math.round(cur.temperature_2m);

      document.getElementById("wxTemp").textContent = temp + "\u00B0";
      document.getElementById("wxMain").textContent = wxTextFor(code);
      document.getElementById("wxDesc").textContent = (cfg.locationName ? cfg.locationName : "");
      document.getElementById("wxIcon").textContent = wxIconFor(code);

      document.getElementById("wxWind").textContent = Math.round(cur.wind_speed_10m) + " mph";
      document.getElementById("wxHum").textContent  = Math.round(cur.relative_humidity_2m) + "%";

      var hi = data.daily && data.daily.temperature_2m_max ? Math.round(data.daily.temperature_2m_max[0]) : temp;
      var lo = data.daily && data.daily.temperature_2m_min ? Math.round(data.daily.temperature_2m_min[0]) : temp;
      document.getElementById("wxHigh").textContent = hi + "\u00B0";
      document.getElementById("wxLow").textContent  = lo + "\u00B0";

      var f=document.getElementById("forecast");
      var t=data.daily.time, maxs=data.daily.temperature_2m_max, mins=data.daily.temperature_2m_min, codes=data.daily.weather_code;
      var dows=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

      var html="";
      for(var i=0;i<Math.min(days, t.length); i++){
        var dt=new Date(t[i]+"T00:00:00");
        var day=dows[dt.getDay()];
        var txt=wxTextFor(codes[i]);
        html += '<div class="fRow">';
        html +=   '<div class="fDay">'+day+'</div>';
        html +=   '<div class="fText">'+txt+'</div>';
        html +=   '<div class="fTemps">'+Math.round(maxs[i])+'\u00B0 / '+Math.round(mins[i])+'\u00B0</div>';
        html += '</div>';
      }
      f.innerHTML = html;
    });
  }

  function buildFilmstrip(cfg){
    var track = document.getElementById("filmTrack");

    xhrJson("photos/photos.json?ts="+Date.now(), function(err, manifest){
      var files = (!err && manifest && manifest.files) ? manifest.files : [];

      if(!files.length){
        track.innerHTML = '<div style="color:rgba(255,255,255,0.85);font-weight:900;padding:10px 12px;">Add images into /photos and list them in photos/photos.json</div>';
        return;
      }

      var html = "";
      for(var pass=0; pass<2; pass++){
        for(var i=0;i<files.length;i++){
          var src = "photos/" + files[i];
          html += '<img class="filmImg" src="'+src+'" alt="">';
        }
      }
      track.innerHTML = html;

      var secs = cfg.filmstripSpeedSeconds || 35;
      track.style.animationDuration = secs + "s";
      track.className = "filmTrack filmRun";
    });
  }

  xhrJson("config.json?ts="+Date.now(), function(err, cfg){
    cfg = cfg || { locationName:"", lat:41.1092, lon:-83.9957, units:"fahrenheit", forecastDays:10, filmstripSpeedSeconds:35, maxEvents:3 };

    tick();
    setInterval(tick, 1000);

    buildCalendar(new Date());
    setInterval(function(){ buildCalendar(new Date()); }, 60*60*1000);

    loadEvents(cfg);
    setInterval(function(){ loadEvents(cfg); }, 5*60*1000);

    loadWeather(cfg);
    setInterval(function(){ loadWeather(cfg); }, 10*60*1000);

    buildFilmstrip(cfg);
    setInterval(function(){ buildFilmstrip(cfg); }, 10*60*1000);
  });
})();
