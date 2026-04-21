const AUTH_KEY = "weather_dashboard_logged_in";
const USER_KEY = "weather_dashboard_user";
const USERNAME_KEY = "weather_dashboard_username";
const WEATHER_API_KEY = "22929ccd2d81e7c3a2ac21ee2041cb1c";
const WEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
let weatherChart;

document.addEventListener("DOMContentLoaded", () => {
    enforceAuth();
});

function enforceAuth() {
    const isLoginPage = window.location.pathname.endsWith("login.html");
    const isProtectedPage = document.body.dataset.protected === "true";
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === "true";

    if (isProtectedPage && !isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    if (isLoginPage && isLoggedIn) {
        window.location.href = "index.html";
    }
}

// ===============================
// 🌟 CARD CLICK HIGHLIGHT EFFECT
// ===============================
function selectCard(element) {
    let cards = document.querySelectorAll(".card");

    // Remove active class from all cards
    cards.forEach(card => {
        card.classList.remove("active");
    });

    // Add active class to clicked card
    element.classList.add("active");
}


// Arrow function to create graph
const createChart = (labels, temperatures) => {
    const chartCanvas = document.getElementById("weatherChart");
    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    const ctx = chartCanvas.getContext("2d");

    if (weatherChart) {
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temperatures,
                    borderColor: "#57c7ff",
                    backgroundColor: "rgba(87, 199, 255, 0.2)",
                    tension: 0.35,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#e8f1ff"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#b9caea" },
                    grid: { color: "rgba(130, 170, 255, 0.15)" }
                },
                y: {
                    ticks: { color: "#b9caea" },
                    grid: { color: "rgba(130, 170, 255, 0.15)" }
                }
            }
        }
    });
};

// Callback function
const processData = (data, callback) => {
    const labels = [];
    const temps = [];

    // Extract first 8 time records
    data.list.slice(0, 8).forEach((item) => {
        labels.push(item.dt_txt);
        temps.push(item.main.temp);
    });

    callback(labels, temps);
};

// Async/Await + Promise
async function getWeather() {

    let cityInput = document.getElementById("city");

    // If input not found (like in blog page), stop
    if (!cityInput) return;

    let city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    let url = `${WEATHER_FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    let result = document.getElementById("weatherResult");

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (String(data.cod) === "200") {
            processData(data, createChart);

            const now = data.list[0];
            result.innerHTML = `
                🌍 ${data.city.name} <br>
                🌡 Current Temperature: ${now.main.temp}°C <br>
                ☁ Weather: ${now.weather[0].description}
            `;
        } else if (Number(data.cod) === 401) {
            result.innerHTML = "❌ Invalid or inactive API key. Use the key from your OpenWeather account API Keys page, then wait for activation.";
        } else if (Number(data.cod) === 429) {
            result.innerHTML = "❌ API limit reached. Please try again later.";
        } else if (Number(data.cod) === 404) {
            result.innerHTML = "❌ City not found. Try a valid city name (example: London).";
        } else {
            result.innerHTML = `❌ ${data.message || "Unable to fetch weather right now."}`;
        }

    } catch (error) {
        console.log(error);
        result.innerHTML = "❌ Error fetching weather data";
    }
}

function setCity(cityName) {
    let cityInput = document.getElementById("city");
    if (!cityInput) return;
    cityInput.value = cityName;
    getWeather();
}

function showTime() {
    let result = document.getElementById("weatherResult");
    if (!result) return;

    let now = new Date();
    result.innerHTML = `🕒 Local time: ${now.toLocaleString()}`;
}

function handleLogin(event) {
    event.preventDefault();

    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let status = document.getElementById("loginStatus");

    if (!username || !password || !status) return;

    const savedUserRaw = localStorage.getItem(USER_KEY);
    const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

    if (!savedUser) {
        status.innerHTML = "❌ No account found. Please sign up first.";
        status.className = "status error";
        return;
    }

    if (
        username.value.trim() === savedUser.username &&
        password.value.trim() === savedUser.password
    ) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(USERNAME_KEY, savedUser.username);
        status.innerHTML = `✅ Welcome, ${username.value.trim()}! Login successful.`;
        status.className = "status success";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
    } else {
        status.innerHTML = "❌ Invalid username or password.";
        status.className = "status error";
    }
}

function handleSignup(event) {
    event.preventDefault();

    let username = document.getElementById("signupUsername");
    let password = document.getElementById("signupPassword");
    let status = document.getElementById("signupStatus");

    if (!username || !password || !status) return;

    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();

    if (!usernameValue || !passwordValue) {
        status.innerHTML = "❌ Please enter username and password.";
        status.className = "status error";
        return;
    }

    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            username: usernameValue,
            password: passwordValue
        })
    );

    status.innerHTML = "✅ Account created. You can now log in.";
    status.className = "status success";
    event.target.reset();
}

function submitContact(event) {
    event.preventDefault();

    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let message = document.getElementById("message");
    let status = document.getElementById("contactStatus");

    if (!name || !email || !message || !status) return;

    if (name.value.trim() && email.value.trim() && message.value.trim()) {
        status.innerHTML = "✅ Thanks! Your message has been sent.";
        status.className = "status success";
        event.target.reset();
    } else {
        status.innerHTML = "❌ Please fill all contact fields.";
        status.className = "status error";
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USERNAME_KEY);
    window.location.href = "login.html";
}