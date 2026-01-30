<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kiosk Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="bg"></div>

  <div id="wrap">
    <!-- LEFT: WEATHER -->
    <section id="left" class="panel panelLeft">
      <div class="wxTop">
        <div id="wxIcon" class="wxIconBig" aria-hidden="true"></div>

        <div class="wxHeadline">
          <div id="wxTemp" class="wxTempBig">--</div>
          <div id="wxMain" class="wxMainBig">Loading</div>
          <div id="wxPlace" class="wxPlace"> </div>
        </div>
      </div>

      <div class="wxStats">
        <div class="statRow"><span>High:</span> <b id="wxHigh">--</b></div>
        <div class="statRow"><span>Low:</span> <b id="wxLow">--</b></div>
        <div class="statRow"><span>Humidity:</span> <b id="wxHum">--</b></div>
        <div class="statRow"><span>Wind:</span> <b id="wxWind">--</b></div>
      </div>

      <div class="leftClock">
        <div id="leftTime" class="leftTime">--:--</div>
        <div id="leftDate" class="leftDate">---</div>
      </div>
    </section>

    <!-- RIGHT -->
    <section id="right">
      <div class="panel panelDark">
        <div class="panelHeader">Photo Slideshow</div>
        <div class="photoWindow">
          <div id="filmTrack" class="filmTrack"></div>
        </div>
      </div>

      <div class="panel panelDark">
        <div class="panelHeader">Upcoming Events</div>
        <div id="eventsList" class="eventsList"></div>
      </div>

      <div id="bottomRow">
        <div class="panel panelDark">
          <div id="calTitle" class="panelHeader smallHeader">January 2026</div>
          <div id="calGrid" class="calGrid"></div>
        </div>

        <div class="panel panelDark clockPanel">
          <div id="time" class="bigTime">--:--</div>
          <div id="date" class="bigDate">---</div>
        </div>
      </div>

      <div class="panel panelDark">
        <div class="panelHeader smallHeader">10 Day Forecast</div>
        <div id="forecast" class="forecastCompact"></div>
      </div>
    </section>
  </div>

  <script src="app.js"></script>
</body>
</html>
