
![Screenshot 2025-02-12 143611.png](<https://media-hosting.imagekit.io//165600fca3584af8/Screenshot%202025-02-12%20143611.png?Expires=1833950540&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=W941~h9T0eJl7DnN2fpqLYfY7UE8~FChVNLPeAO0oBBMjpNHgfcjWwkFU00pU4slufeRJbYFZ8FTkG1D1DrlBXAbtvVQmeIarl1YP~RpWTbHFDg-lo25tqog6L9a9KxaJx43L0IVSxDliBBpzoeSd2e0gpj5U~USj3NgvXhbaZEHQru4~l0JshTR-5XniAn88U~971pAdBplCF9v4Dhg8xo10KvLpCEdQB5ckHsYe36y-t03mhuwI-87afCOGeiCFEwfltS-DzximbFBg-li0LqrR8HIG~Ol3gx1bqo1dLpGB6481UbTdt~VyuOEvsrgE5mVWD6RWmnzTltyGvcZkw__>)
# HumidSG

HumidSG is a web application that provides real-time relative humidity data across Singapore. This project fetches data from the [Singapore Government Open Data Portal](https://data.gov.sg/)'s Relative Humidity API and displays it in an interactive UI. It allows users to view average humidity across Singaore, specific humidity levels at various weather stations and even determine the humidity at their current location.


## ✨ Features

### **1. Real-Time Humidity Data**

The application makes an API call to retrieve the latest available humidity readings from various weather stations in Singapore. The data updates dynamically to ensure users have access to the most recent weather conditions.

### **2. Nearest Weather Station Detection**

The application uses the user's geolocation data to determine their exact latitude and longitude. It then calculates the distance between the user's location and multiple weather stations, selecting the closest one. This feature allows users to obtain the most relevant humidity reading for their location.

### **3. Average Humidity Calculation**

To provide a general overview of the humidity conditions across Singapore, the application calculates and displays the average humidity across all available weather stations. This feature is useful for users who want a broad understanding of the current weather conditions rather than location-specific data.

### **4. Dropdown Selection for Specific Stations**

Users who wish to check humidity levels at a particular location can select from a list of weather stations via a dropdown menu. This feature allows users to explore different areas rather than relying solely on their current location.

### **5. Last Updated Timestamp**

Since real-time data can change frequently, the application includes a timestamp indicating the last time the humidity data was retrieved. This helps users determine how recent the displayed information is and decide whether they need to refresh the page.

### **6. Clean and Minimalist UI**

The interface is designed to be simple and user-friendly, ensuring that users can access the data they need without unnecessary complexity. The UI is structured to be intuitive, with clear labels, easy-to-read data, and a smooth user experience.

## Technologies Used

-   **Frontend**: HTML, CSS, JavaScript
-   **Data Source**: [Singapore Relative Humidity API](https://data.gov.sg/datasets/d_2d3b0c4da128a9a59efca806441e1429/view#tag/default/GET/relative-humidity)
-   **Deployment**: [GitHub](https://github.com/) 


## 📝 Usage

### **Fetching Humidity Data**

The application retrieves real-time humidity data using an API call:

```js
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
    } catch (error) {
        console.error("Error fetching humidity:", error);
    }
}

```

**Explanation:**

-   The function sends a request to the API and retrieves JSON data.
-   It then extracts the list of weather stations (`stations`) and the humidity readings (`readings`).
-   A timestamp is also stored to indicate when the data was last updated.
-   If the data format is invalid or missing, an error is thrown and logged to the console.

### **Calculating Distance Between Locations**

To determine the user's nearest weather station, the application calculates the distance between two geographical points using the **Haversine formula**:

```js
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

```

**Explanation:**

-   The function calculates the shortest distance between two points on Earth given their latitude and longitude.
-   It converts degrees to radians and applies the **Haversine formula**, which is commonly used for geographic distance calculations.
-   The result is returned in kilometers.

### **Finding the Nearest Weather Station**

```js
function findNearestStation(userLat, userLon) {
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

```

**Explanation:**

-   This function loops through all available weather stations and calculates the distance between each station and the user's location.
-   The station with the smallest distance is selected as the nearest weather station.

### **Displaying Specific Humidity Data**

```js
function specHumidity() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const nearestStation = findNearestStation(latitude, longitude);
            const reading = readings.find(r => r.stationId == nearestStation.id);

            document.getElementById("spec").textContent = reading ? `${reading.value}%` : "No data available";
        },
        (error) => {
            console.error("Geolocation error:", error);
        }
    );
}

```

**Explanation:**

-   The function uses the **Geolocation API** to retrieve the user's coordinates.
-   It then finds the nearest weather station and looks up the corresponding humidity reading.
-   The humidity value is displayed in the HTML element with the ID `spec`.
-   If geolocation fails, an error message is logged to the console.

### **Displaying Average Humidity Data**

```js
function avgHumidity()  {
	if (!readings  ||  readings.length  ===  0) {
		console.error("No readings available for average calculation.");
		return  "N/A";
	}
	
	let  totalHumidity  =  0;
	readings.forEach(reading  => {
		totalHumidity  +=  reading.value;
	});
	return (totalHumidity  /  readings.length).toFixed(2);
}
```


**Explanation:**

-   The function calculates the average humidity from a list of readings.
-   It first checks if there are any readings available and log an error message if it's empty or undefined.
-   If readings are available, it loops through each reading in the `readings` array and add `humidity.value` to the `totalHumidity`.
-   The average humidity value is returned.

### **Displaying Average Humidity Data**

```js
function  optHumidity()  {
	const  optDropdown  =  document.getElementById("stationSelect");
	const  optValue  =  document.getElementById("opt");
	if (!optDropdown  ||  !optValue) {
		console.error("Dropdown or display element not found!");
		return;
	}
	const  id  =  optDropdown.value;
	if (!readings  ||  readings.length  ===  0) {
		optValue.textContent  =  "No data available";
		return;
	}
	const  reading  =  readings.find(r  =>  r.stationId  ==  id);
	optValue.textContent  =  reading  ?  `${reading.value}%`  :  "No data available";
}
```

**Explanation:**

-   The function fetches the selected station's humidity value from the dropdown.
-   It checks if the dropdown and display elements exist; if not, an error is logged.
-   It then looks for a reading that matches the selected station ID.
-   If found, it displays the humidity; otherwise, it logs and error.

## 📸 Screenshots


![Screenshot 2025-02-12 151536.png](<https://media-hosting.imagekit.io//ab2095980d3a4327/Screenshot%202025-02-12%20151536.png?Expires=1833952843&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=OMqpnzaCQt7SLwRoSHWTAf8JipHD7Wq9PFmDmINRElDA3I0bVQLEEMtukx~9b5xHljT4KmsgQ-1BdJ-rBVCM08qwU-wU6soDc3yh5snsLwvMJ-3fUlDvi1AzyPSO3iot2QutTgQq9mkef7hQMNAd4OPRnZjKtsd~E9xZNcDo-PdjLvEm3xLew21L0--u-9tLr6dvtaYZhVhrulIf875FIuj~8z1StgMywibJTW7fHnOKw2AzPVyYorPfN~LgVieFa4G1qDh8QqBcFQM7oYF6QXnUQIiwaT4dCYAW9desq2s3mz7UBDP7rfIhkYV1cwPjhWHyOR6wV5vf1WzbpMmwrQ__>)
## 🗺️ Roadmap

- [ ] **Implement additional weather data** (e.g., temperature, wind speed)
- [ ] **Enhance UI/UX** with animations and better visualization
- [ ]  **Add dark mode support** for better accessibility

## ©️ Credits

-   **Singapore Government API**: This project uses data from the official Singapore Government API for retrieving weather and humidity information.
- **Logo**: The logo design was created by [@Ashishsharma](https://www.figma.com/@Ashishsharma)
-   **ChatGPT**: Thanks to ChatGPT for providing guidance and assistance in developing and refining the code.


## 📨 Contact

-   **GitHub**: [@linnxyz](https://github.com/linnxyz/)
-   **Email**: [linnthitg@gmail.com](mailto:linnthitg@gmail.com)
