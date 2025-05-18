async function fetchAirportCharts(airportCode) {
    try {
        // Show loading state
        document.getElementById('chartsList').innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch from our backend API which will then call AviationAPI
        const response = await fetch(`/api/charts/${airportCode}`);
        const data = await response.json();
        
        if (data.error) {
            document.getElementById('chartsList').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        let chartsHtml = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    Available Charts for ${airportCode}
                </div>
                <div class="card-body">
                    <div class="list-group">
        `;
        
        if (data.length > 0) {
            // Group charts by type
            const chartGroups = {};
            data.forEach(chart => {
                if (!chartGroups[chart.chart_type]) {
                    chartGroups[chart.chart_type] = [];
                }
                chartGroups[chart.chart_type].push(chart);
            });
            
            // Create accordion for each chart type
            for (const [chartType, charts] of Object.entries(chartGroups)) {
                chartsHtml += `
                    <div class="accordion mb-2" id="accordion${chartType.replace(/\s+/g, '')}">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${chartType.replace(/\s+/g, '')}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${chartType.replace(/\s+/g, '')}" aria-expanded="false" aria-controls="collapse${chartType.replace(/\s+/g, '')}">
                                    ${chartType} (${charts.length})
                                </button>
                            </h2>
                            <div id="collapse${chartType.replace(/\s+/g, '')}" class="accordion-collapse collapse" aria-labelledby="heading${chartType.replace(/\s+/g, '')}" data-bs-parent="#accordion${chartType.replace(/\s+/g, '')}">
                                <div class="accordion-body">
                                    <div class="list-group">
                `;
                
                charts.forEach(chart => {
                    chartsHtml += `
                        <a href="${chart.pdf_path}" target="_blank" class="list-group-item list-group-item-action chart-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${chart.chart_name}</h6>
                                <small>${chart.chart_date}</small>
                            </div>
                            <p class="mb-1">${chart.chart_code}</p>
                        </a>
                    `;
                });
                
                chartsHtml += `
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            chartsHtml += '<div class="alert alert-warning">No charts available for this airport.</div>';
        }
        
        chartsHtml += `
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('chartsList').innerHTML = chartsHtml;
        
    } catch (error) {
        console.error('Error fetching airport charts:', error);
        document.getElementById('chartsList').innerHTML = '<div class="alert alert-danger">Failed to fetch charts. Please try again.</div>';
    }
}