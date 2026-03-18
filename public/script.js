const API_KEY = "246c5972d37205572b347da61dfc82fa";
let chart;
let map;
let marker;

// 🌤 Get weather
async function getWeather(cityParam) {
  try {
    const city = cityParam || document.getElementById("city").value;

    if (!city) {
      alert("Enter city name");
      return;
    }

   const res = await fetch("http://localhost:5000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
});
    const data = await res.json();

    if (data.cod != 200) {
      alert("City not found");
      return;
    }
    

    // Save last city
    localStorage.setItem("lastCity", city);

    document.getElementById("cityName").innerText = data.name;
    document.getElementById("temp").innerText = "🌡 " + data.main.temp + " °C";
    document.getElementById("desc").innerText =
      "☁ " + data.weather[0].description;
    document.getElementById("humidity").innerText =
      "💧 " + data.main.humidity + "%";
    document.getElementById("wind").innerText =
      "🌬 " + data.wind.speed + " m/s";

    document.getElementById("icon").src =
      `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    saveSearch(city);
    changeBackground(data.weather[0].main.toLowerCase());
    showMap(data.coord.lat, data.coord.lon);

    getForecast(city);
  } catch (error) {
    alert("Error fetching weather");
  }
}

// 🌦 Forecast
async function getForecast(city) {
  try {
    let res = await fetch(`http://localhost:5000/forecast/${city}`);
    let data = await res.json();

    let forecast = document.getElementById("forecast");
    if (!forecast) return;

    forecast.innerHTML = "";

    let temps = [];
    let labels = [];

    for (let i = 0; i < 5; i++) {
      let item = data.list[i * 8];

      temps.push(item.main.temp);
      labels.push(item.dt_txt.split(" ")[0]);

      forecast.innerHTML += `
        <div class="forecast-card">
          <p>${labels[i]}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
          <p>${temps[i]}°C</p>
        </div>
      `;
    }

    createChart(labels, temps);
  } catch (error) {
    console.log(error);
  }
}

// 📊 Chart
function createChart(labels, temps) {
  const ctx = document.getElementById("tempChart");
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "orange",
          backgroundColor: "rgba(255,165,0,0.2)",
          fill: true,
        },
      ],
    },
  });
}

// 💾 Save history
function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.unshift(city);
  history = [...new Set(history)].slice(0, 5);

  localStorage.setItem("history", JSON.stringify(history));

  showHistory();
}

// 📜 Show history
function showHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  let list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";

  history.forEach((city) => {
    let li = document.createElement("li");
    li.innerText = city;
    li.onclick = () => getWeather(city);
    list.appendChild(li);
  });
}
function clearHistory() {
  if (confirm("Clear all search history?")) {
    localStorage.removeItem("history");
    document.getElementById("historyList").innerHTML = "";
  }
}

// 🎨 Background change
function changeBackground(weather) {
  const body = document.body;

  if (weather.includes("cloud"))
    body.style.background = "linear-gradient(120deg,#667eea,#764ba2)";
  else if (weather.includes("rain"))
    body.style.background = "linear-gradient(120deg,#3a7bd5,#3a6073)";
  else if (weather.includes("clear"))
    body.style.background = "linear-gradient(120deg,#f6d365,#fda085)";
  else body.style.background = "linear-gradient(120deg,#4facfe,#00f2fe)";
}

// Load history on start
showHistory();

// 📍 Get weather by location
function getLocationWeather() {

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      try {
        let res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
        );

        let data = await res.json();

        if (data.cod != 200) {
          alert("Location weather not found");
          return;
        }

        // UI update
        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temp").innerText =
          "🌡 " + data.main.temp + " °C";
        document.getElementById("desc").innerText =
          "☁ " + data.weather[0].description;
        document.getElementById("humidity").innerText =
          "💧 " + data.main.humidity + "%";
        document.getElementById("wind").innerText =
          "🌬 " + data.wind.speed + " m/s";

        document.getElementById("icon").src =
          `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // Save + background + forecast
        saveSearch(data.name);
        changeBackground(data.weather[0].main.toLowerCase());
        getForecast(data.name);
      } catch (err) {
        alert("Error getting location weather");
      }
    },
    (error) => {
      alert("Location permission denied");
    },
  );
}
function showMap(lat, lon) {

  if (!map) {
    map = L.map('map').setView([lat, lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

  } else {
    map.setView([lat, lon], 10);
  }

  if (marker) {
    marker.remove();
  }

  marker = L.marker([lat, lon]).addTo(map)
    .bindPopup("📍 Your Location")
    .openPopup();

     
}
 showMap(lat, lon);