let stations = null;
let readings = null;

async function fetchAPI() {
    try {
        const response = await fetch(`https://api-open.data.gov.sg/v2/real-time/api/relative-humidity`);
        const data = await response.json();

        if (!data.data || !data.data.stations || !data.data.readings) {
            throw new Error("Invalid data format");
        }

        stations = data.data.stations;
        readings = data.data.readings[0].data;
        timestamp = new Date(data.data.readings[0].timestamp);

        console.log(stations);
        console.log(readings);
        console.log(`Last updated: ${timestamp.toLocaleString()}`);

        lastUpdated(timestamp);

        addOption();
    } catch (error) {
        console.error("Error fetching humidity:", error);
    }
}

async function specHumidity() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log("User's Location:", latitude, longitude);
                const nearestStation = findNearestStation(latitude, longitude);
                console.log("Nearest Station:", nearestStation);

                if (!nearestStation) {
                    reject("Could not find nearest station.");
                    return;
                }

                let dataFound = false;
                const stationID = document.getElementById("stationId");
                const stationName = document.getElementById("stationName");
                const humidityValue = document.getElementById("spec");

                const reading = readings.find(r => r.stationId == nearestStation.id);
                if (reading) {
                    stationID.textContent = nearestStation.id;
                    stationName.textContent = nearestStation.name;
                    humidityValue.textContent = `${reading.value}%`;
                    dataFound = true;
                }
                if (!dataFound) {
                    humidityValue.textContent = "No data available";
                    console.log(`No data available for ${nearestStation.name}`);
                }
                resolve();
            },
            (error) => {
                if (error.code === 1) {
                    const spinner = document.getElementById("spinner");
                    const error = document.createElement("span");
                    error.textContent = "Please allow location access to get the specific humidity in your area.";
                    
                    spinner.style.display = "none";
                    spinnerWrapper.appendChild(error);
                }
            }
        );
    });
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function findNearestStation(userLat, userLon) {
    if (!stations || stations.length === 0) {
        console.error("No stations available");
        return null;
    }

    let nearestStation = null;
    let minDistance = Infinity;

    stations.forEach(station => {
        const distance = getDistance(userLat, userLon, station.location.latitude, station.location.longitude);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = station;
        }
    });
    return nearestStation;
}

function avgHumidity() {
    if (!readings || readings.length === 0) {
        console.error("No readings available for average calculation.");
        return "N/A";
    }

    let totalHumidity = 0;
    readings.forEach(reading => {
        totalHumidity += reading.value;
    });
    return (totalHumidity / readings.length).toFixed(2);
}

function addOption() {
    const optDropdown = document.getElementById("stationSelect");
    if (!stations || stations.length === 0) {
        console.error("No stations available to populate dropdown.");
        return;
    }

    optDropdown.innerHTML = "";
    stations.forEach(station => {
        let newOption = new Option(station.name, station.id);
        optDropdown.add(newOption);
    });

    optDropdown.addEventListener("change", optHumidity);
    optHumidity();
}

function optHumidity() {
    const optDropdown = document.getElementById("stationSelect");
    const optValue = document.getElementById("opt");

    if (!optDropdown || !optValue) {
        console.error("Dropdown or display element not found!");
        return;
    }

    const id = optDropdown.value;
    if (!readings || readings.length === 0) {
        optValue.textContent = "No data available";
        return;
    }

    const reading = readings.find(r => r.stationId == id);
    optValue.textContent = reading ? `${reading.value}%` : "No data available";
}

function lastUpdated(timestamp) {
    const lastUpdatedValue = document.getElementById("lastUpdated");
    let now = new Date();
    
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
        lastUpdatedValue.textContent = "Just now";
    } else {
        lastUpdatedValue.textContent = diffMinutes + " minutes ago";
    }
}

function reloadPage() {
    window.location.reload();
}

async function run() {
    document.body.style.overflow = "hidden";
    await fetchAPI();
    document.body.style.overflow = "auto";
    
    const loader = document.getElementById("loader");
    loader.style.display = "none";

    // Set average humidity
    const avgValue = document.getElementById("avg");
    avgValue.textContent = `${avgHumidity()}%`;

    const spinnerWrapper = document.getElementById("spinnerWrapper");

    
    spinnerWrapper.style.display = "flex";
    await specHumidity();
    spinnerWrapper.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const loaderText = document.querySelector(".loader h1");
    const text = loaderText.textContent;
    loaderText.textContent = "";

    // Wrap each letter in a span
    text.split("").forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.setProperty('--i', index);
        loaderText.appendChild(span);
    });
});

// Run everything
run();
