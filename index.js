require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public')); // Serve static files from public directory

// Database connection (Supabase)
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes

// Airport Information Endpoint
app.get('/api/airport/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        // First check our database for cached data
        const { data: cachedData, error: cacheError } = await supabase
            .from('airports')
            .select('*')
            .eq('icao', code.toUpperCase())
            .single();
        
        if (!cacheError && cachedData) {
            // If found in cache and not expired (e.g., cached within last 24 hours)
            const lastUpdated = new Date(cachedData.updated_at);
            const now = new Date();
            const hoursDiff = Math.abs(now - lastUpdated) / 36e5;
            
            if (hoursDiff < 24) {
                return res.json(cachedData.data);
            }
        }
        
        // If not in cache or expired, fetch from AviationAPI
        const response = await axios.get(`https://api.aviationapi.com/v1/airports?apt=${code}`);
        const airportData = response.data;
        
        if (!airportData || !airportData[code]) {
            return res.status(404).json({ error: 'Airport not found' });
        }
        
        const airport = airportData[code][0];
        
        // Transform data to our preferred format
        const transformedData = {
            icao: airport.icao,
            faa: airport.faa,
            name: airport.name,
            city: airport.city,
            state: airport.state,
            country: airport.country,
            latitude: airport.latitude,
            longitude: airport.longitude,
            elevation: airport.elevation,
            tower_frequency: airport.tower_frequency,
            atis_frequency: airport.atis_frequency,
            runways: airport.runways ? airport.runways.split(', ') : []
        };
        
        // Cache the data in Supabase
        const { error: upsertError } = await supabase
            .from('airports')
            .upsert({
                icao: code.toUpperCase(),
                data: transformedData,
                updated_at: new Date().toISOString()
            });
        
        if (upsertError) {
            console.error('Error caching airport data:', upsertError);
        }
        
        res.json(transformedData);
        
    } catch (error) {
        console.error('Error fetching airport data:', error);
        res.status(500).json({ error: 'Failed to fetch airport data' });
    }
});

// Airport Charts Endpoint
app.get('/api/charts/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        // Check cache first
        const { data: cachedData, error: cacheError } = await supabase
            .from('charts')
            .select('*')
            .eq('airport_code', code.toUpperCase())
            .single();
        
        if (!cacheError && cachedData) {
            const lastUpdated = new Date(cachedData.updated_at);
            const now = new Date();
            const hoursDiff = Math.abs(now - lastUpdated)