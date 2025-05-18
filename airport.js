async function fetchAirportInfo(airportCode) {
    try {
        // Show loading state
        document.getElementById('airportInfo').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // First fetch from our backend API which will then call AviationAPI
        const response = await fetch(`/api/airport/${airportCode}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('airportInfo').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        // Display airport information
        let html = `
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    ${data.name} (${data.icao})
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Location:</strong> ${data.city}, ${data.state}, ${data.country}</p>
                            <p><strong>Elevation:</strong> ${data.elevation} ft</p>
                            <p><strong>Runways:</strong> ${data.runways.length}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Tower Frequency:</strong> ${data.tower_frequency || 'N/A'}</p>
                            <p><strong>ATIS Frequency:</strong> ${data.atis_frequency || 'N/A'}</p>
                            <p><strong>Coordinates:</strong> ${data.latitude}, ${data.longitude}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('airportInfo').innerHTML = html;
        
        // Now fetch weather data directly from AviationAPI
        fetchWeatherInfo(airportCode);
        
    } catch (error) {
        console.error('Error fetching airport info:', error);
        document.getElementById('airportInfo').innerHTML = '<div class="alert alert-danger">Failed to fetch airport information. Please try again.</div>';
    }
}

async function fetchWeatherInfo(airportCode) {
    try {
        // Show loading state
        document.getElementById('weatherInfo').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch METAR data directly from AviationAPI
        const metarResponse = await fetch(`https://api.aviationapi.com/v1/weather/metar?apt=${airportCode}`);
        const metarData = await metarResponse.json();
        
        // Fetch TAF data directly from AviationAPI
        const tafResponse = await fetch(`https://api.aviationapi.com/v1/weather/taf?apt=${airportCode}`);
        const tafData = await tafResponse.json();
        
        let weatherHtml = `
            <div class="card weather-card">
                <div class="card-header bg-info text-white">
                    Current Weather (METAR)
                </div>
                <div class="card-body">
        `;
        
        if (metarData && metarData[airportCode]) {
            const metar = metarData[airportCode][0];
            weatherHtml += `
                <p><strong>Temperature:</strong> ${metar.temp_c}°C (${metar.temp_f}°F)</p>
                <p><strong>Wind:</strong> ${metar.wind_dir}° at ${metar.wind_speed_kt} kt</p>
                <p><strong>Visibility:</strong> ${metar.visibility_statute_mi} miles</p>
                <p><strong>Clouds:</strong> ${metar.sky_condition || 'Clear'}</p>
                <p><strong>Pressure:</strong> ${metar.altim_in_hg} inHg</p>
                <p><small>Raw METAR: ${metar.raw_metar}</small></p>
            `;
        } else {
            weatherHtml += '<p>No current weather data available</p>';
        }
        
        weatherHtml += `
                </div>
            </div>
            
            <div class="card weather-card mt-3">
                <div class="card-header bg-info text-white">
                    Forecast (TAF)
                </div>
                <div class="card-body">
        `;
        
        if (tafData && tafData[airportCode]) {
            const taf = tafData[airportCode][0];
            weatherHtml += `
                <p><strong>Issued:</strong> ${taf.issue_time}</p>
                <p><strong>Valid:</strong> ${taf.valid_time_from} to ${taf.valid_time_to}</p>
                <p>${taf.raw_taf}</p>
            `;
        } else {
            weatherHtml += '<p>No forecast data available</p>';
        }
        
        weatherHtml += `
                </div>
            </div>
        `;
        
        document.getElementById('weatherInfo').innerHTML = weatherHtml;
        
    } catch (error) {
        console.error('Error fetching weather info:', error);
        document.getElementById('weatherInfo').innerHTML = '<div class="alert alert-warning">Failed to fetch weather information.</div>';
    }
}

async function fetchPreferredRoute(origin, destination) {
    try {
        // Show loading state
        document.getElementById('routeInfo').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch from our backend API which will then call AviationAPI
        const response = await fetch(`/api/routes/${origin}/${destination}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('routeInfo').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        let routeHtml = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    Preferred Route: ${origin} to ${destination}
                </div>
                <div class="card-body">
        `;
        
        if (data.length > 0) {
            data.forEach(route => {
                routeHtml += `
                    <div class="mb-3">
                        <h5>Route ${route.route}</h5>
                        <p><strong>Type:</strong> ${route.type}</p>
                        <p><strong>Altitude Range:</strong> ${route.min_altitude || 'N/A'} - ${route.max_altitude || 'N/A'}</p>
                        <p><strong>Route:</strong> ${route.route_string}</p>
                    </div>
                    <hr>
                `;
            });
        } else {
            routeHtml += '<p>No preferred routes found between these airports.</p>';
        }
        
        routeHtml += `
                </div>
            </div>
        `;
        
        document.getElementById('routeInfo').innerHTML = routeHtml;
        
    } catch (error) {
        console.error('Error fetching preferred routes:', error);
        document.getElementById('routeInfo').innerHTML = '<div class="alert alert-danger">Failed to fetch route information. Please try again.</div>';
    }
}