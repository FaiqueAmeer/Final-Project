async function fetchVATSIMData(airportCode) {
    try {
        // Show loading state for both flights and controllers
        document.getElementById('vatsimFlights').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        document.getElementById('vatsimControllers').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch VATSIM flights data directly from AviationAPI
        const flightsResponse = await fetch(`https://api.aviationapi.com/v1/vatsim/pilots?apt=${airportCode}`);
        const flightsData = await flightsResponse.json();
        
        // Fetch VATSIM controllers data directly from AviationAPI
        const controllersResponse = await fetch(`https://api.aviationapi.com/v1/vatsim/controllers?fac=${airportCode}`);
        const controllersData = await controllersResponse.json();
        
        // Display flights data
        let flightsHtml = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    Active Flights at ${airportCode}
                </div>
                <div class="card-body">
        `;
        
        if (flightsData && Object.keys(flightsData).length > 0) {
            flightsHtml += `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Callsign</th>
                                <th>Aircraft</th>
                                <th>Departure</th>
                                <th>Arrival</th>
                                <th>Altitude</th>
                                <th>Speed</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            Object.values(flightsData).forEach(flightGroup => {
                flightGroup.forEach(flight => {
                    flightsHtml += `
                        <tr class="flight-item">
                            <td>${flight.callsign}</td>
                            <td>${flight.flight_plan?.aircraft_faa || 'N/A'}</td>
                            <td>${flight.flight_plan?.departure || 'N/A'}</td>
                            <td>${flight.flight_plan?.arrival || 'N/A'}</td>
                            <td>${flight.altitude}</td>
                            <td>${flight.groundspeed} kt</td>
                        </tr>
                    `;
                });
            });
            
            flightsHtml += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            flightsHtml += '<p>No active flights at this airport.</p>';
        }
        
        flightsHtml += `
                </div>
            </div>
        `;
        
        document.getElementById('vatsimFlights').innerHTML = flightsHtml;
        
        // Display controllers data
        let controllersHtml = `
            <div class="card mt-4">
                <div class="card-header bg-primary text-white">
                    Active Controllers at ${airportCode}
                </div>
                <div class="card-body">
        `;
        
        if (controllersData && Object.keys(controllersData).length > 0) {
            controllersHtml += `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Callsign</th>
                                <th>Frequency</th>
                                <th>Name</th>
                                <th>Online For</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            Object.values(controllersData).forEach(controllerGroup => {
                controllerGroup.forEach(controller => {
                    // Calculate time online
                    const loginTime = new Date(controller.logon_time);
                    const now = new Date();
                    const hoursOnline = Math.floor((now - loginTime) / (1000 * 60 * 60));
                    const minutesOnline = Math.floor((now - loginTime) / (1000 * 60)) % 60;
                    
                    controllersHtml += `
                        <tr class="controller-item">
                            <td>${controller.callsign}</td>
                            <td>${controller.frequency}</td>
                            <td>${controller.name}</td>
                            <td>${hoursOnline}h ${minutesOnline}m</td>
                        </tr>
                    `;
                });
            });
            
            controllersHtml += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            controllersHtml += '<p>No active controllers at this facility.</p>';
        }
        
        controllersHtml += `
                </div>
            </div>
        `;
        
        document.getElementById('vatsimControllers').innerHTML = controllersHtml;
        
    } catch (error) {
        console.error('Error fetching VATSIM data:', error);
        document.getElementById('vatsimFlights').innerHTML = '<div class="alert alert-danger">Failed to fetch flight data. Please try again.</div>';
        document.getElementById('vatsimControllers').innerHTML = '<div class="alert alert-danger">Failed to fetch controller data. Please try again.</div>';
    }
}