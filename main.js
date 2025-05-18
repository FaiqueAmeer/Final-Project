document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab functionality
    const tabElms = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElms.forEach(tabElm => {
        tabElm.addEventListener('click', function(event) {
            const tabId = this.getAttribute('data-bs-target');
            const activeTab = document.querySelector(`${tabId}`);
            activeTab.classList.add('fade-in');
        });
    });

    // Airport search functionality
    document.getElementById('searchAirport').addEventListener('click', function() {
        const airportCode = document.getElementById('airportCode').value.trim();
        if (airportCode) {
            fetchAirportInfo(airportCode);
            fetchAirportCharts(airportCode);
            fetchVATSIMData(airportCode);
        } else {
            alert('Please enter an airport code');
        }
    });

    // Route search functionality
    document.getElementById('searchRoute').addEventListener('click', function() {
        const origin = document.getElementById('originAirport').value.trim();
        const destination = document.getElementById('destinationAirport').value.trim();
        
        if (origin && destination) {
            fetchPreferredRoute(origin, destination);
        } else {
            alert('Please enter both origin and destination airports');
        }
    });
});