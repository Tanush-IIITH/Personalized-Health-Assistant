#!/usr/bin/env node

/**
 * Wearable Data Generator
 * Generates 7 days of realistic minute-by-minute heart rate and sleep data
 * for testing Person 3's wearable ingestion API.
 * 
 * Usage:
 *   node generate_wearable_data.js [--patient-id=pat-3] [--output=wearable_payload.json]
 */

const fs = require('fs');
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);
let patientId = 'pat-3';
let outputFile = 'wearable_payload.json';

args.forEach(arg => {
  if (arg.startsWith('--patient-id=')) {
    patientId = arg.split('=')[1];
  } else if (arg.startsWith('--output=')) {
    outputFile = arg.split('=')[1];
  }
});

// Utility functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNormalDistributionValue(mean, stdDev) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Generate heart rate data for a single day
 * Simulates realistic circadian patterns:
 * - Sleep (11pm-6am): 55-70 bpm
 * - Wake/Rest (6am-8am): 65-80 bpm
 * - Active (8am-11pm): 70-100 bpm with activity spikes
 */
function generateHeartRateData(date, patientId) {
  const data = [];
  const dateObj = new Date(date);
  
  for (let minute = 0; minute < 24 * 60; minute++) {
    const hour = Math.floor(minute / 60);
    let bpm;
    let isActive = false;
    
    if (hour >= 23 || hour < 6) {
      // Sleep phase: 55-70 bpm
      bpm = Math.round(getNormalDistributionValue(62, 4));
    } else if (hour >= 6 && hour < 8) {
      // Wake up: 65-80 bpm
      bpm = Math.round(getNormalDistributionValue(72, 5));
    } else {
      // Active phase: 70-100 bpm
      bpm = Math.round(getNormalDistributionValue(78, 8));
      isActive = true;
      
      // Random activity spikes (simulating exercise/movement)
      if (Math.random() < 0.15) {
        bpm += getRandomInt(15, 35);
      }
    }
    
    // Ensure bounds
    bpm = Math.max(40, Math.min(180, bpm));
    
    const timestamp = new Date(dateObj);
    timestamp.setMinutes(timestamp.getMinutes() + minute);
    
    data.push({
      timestamp: timestamp.toISOString(),
      heartRate: bpm,
      confidence: 0.95 + Math.random() * 0.05,
      deviceId: 'wear_001',
      sensorType: 'ppg'
    });
  }
  
  return data;
}

/**
 * Generate sleep data for a single day
 * Tracks sleep stages: awake, light, deep, REM
 * Typical pattern: 11pm-6am sleep with 2-3 sleep cycles
 */
function generateSleepData(date, patientId) {
  const data = [];
  const dateObj = new Date(date);
  
  // Sleep usually 11pm-6am (7 hours by default, variant +/- 1 hour)
  const sleepDurationMinutes = getRandomInt(360, 480); // 6-8 hours
  const sleepStartMinute = 23 * 60; // Start at 11pm
  
  for (let minute = sleepStartMinute; minute < sleepStartMinute + sleepDurationMinutes; minute++) {
    const minuteInSleep = minute % (sleepStartMinute + 1440) - sleepStartMinute;
    let stage = 'awake';
    
    // Sleep cycles: ~90 mins each
    const cyclePosition = minuteInSleep % 90;
    
    if (minuteInSleep < 15) {
      stage = 'awake'; // Going to sleep
    } else if (minuteInSleep < 45) {
      stage = cyclePosition < 20 ? 'light' : 'deep';
    } else if (minuteInSleep < 80) {
      stage = 'rem';
    } else {
      stage = 'light';
    }
    
    const actualMinute = minute % (24 * 60);
    const timestamp = new Date(dateObj);
    timestamp.setMinutes(timestamp.getMinutes() + actualMinute);
    
    data.push({
      timestamp: timestamp.toISOString(),
      stage: stage,
      confidence: 0.92 + Math.random() * 0.08,
      deviceId: 'wear_001',
      sensorType: 'accelerometer'
    });
  }
  
  return data;
}

/**
 * Generate 7 days of wearable data
 */
function generateWeekData(patientId, endDate = new Date()) {
  const days = 7;
  const heartRateData = [];
  const sleepData = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    heartRateData.push(...generateHeartRateData(dateStr, patientId));
    sleepData.push(...generateSleepData(dateStr, patientId));
  }
  
  return { heartRateData, sleepData };
}

/**
 * Main payload generator
 */
function generatePayload() {
  const endDate = new Date('2026-03-05'); // Match the frontend date
  const { heartRateData, sleepData } = generateWeekData(patientId, endDate);
  
  // Calculate summaries
  const avgHeartRate = Math.round(
    heartRateData.reduce((acc, d) => acc + d.heartRate, 0) / heartRateData.length
  );
  
  const sleepStages = sleepData.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {});
  
  const payload = {
    timestamp: new Date().toISOString(),
    patientId: patientId,
    dataSource: 'google_fit',
    deviceInfo: {
      manufacturer: 'Samsung',
      model: 'Galaxy Watch 6',
      osVersion: 'WearOS 3.5',
      appVersion: '5.2.1'
    },
    dataPoints: {
      heartRate: {
        unit: 'bpm',
        sensorType: 'ppg',
        samplingInterval: '1m',
        dataPoints: heartRateData,
        statistics: {
          count: heartRateData.length,
          min: Math.min(...heartRateData.map(d => d.heartRate)),
          max: Math.max(...heartRateData.map(d => d.heartRate)),
          average: avgHeartRate,
          stdDev: Math.round(
            Math.sqrt(
              heartRateData.reduce((acc, d) => acc + Math.pow(d.heartRate - avgHeartRate, 2), 0) /
              heartRateData.length
            )
          )
        }
      },
      sleep: {
        unit: 'stages',
        sensorType: 'accelerometer',
        samplingInterval: '1m',
        dataPoints: sleepData,
        statistics: {
          count: sleepData.length,
          stages: sleepStages,
          totalSleepMinutes: sleepData.length,
          totalSleepHours: Math.round(sleepData.length / 60)
        }
      }
    },
    dateRange: {
      startDate: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    },
    metadata: {
      generatedBy: 'wearable_data_generator',
      version: '2.0',
      format: 'healthconnect/googlefit',
      totalDataPoints: heartRateData.length + sleepData.length
    }
  };
  
  return payload;
}

// Main execution
console.log(`🔄 Generating wearable data for patient ${patientId}...`);
const payload = generatePayload();
const outputPath = path.join(__dirname, outputFile);

try {
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`✅ Wearable payload generated successfully!`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Data points generated: ${payload.metadata.totalDataPoints}`);
  console.log(`📅 Date range: ${payload.dateRange.startDate} to ${payload.dateRange.endDate}`);
  console.log(`❤️  Heart rate: ${payload.dataPoints.heartRate.statistics.min}-${payload.dataPoints.heartRate.statistics.max} bpm (avg: ${payload.dataPoints.heartRate.statistics.average})`);
  console.log(`😴 Sleep: ${payload.dataPoints.sleep.statistics.totalSleepHours} hours/night on average`);
} catch (err) {
  console.error(`❌ Error generating payload: ${err.message}`);
  process.exit(1);
}

module.exports = { generatePayload, generateWeekData };
