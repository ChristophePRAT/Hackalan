import { NextResponse } from 'next/server';

// Helper function to convert value based on type
function convertValue(value: string, valueType: string): number {
    if (valueType === 'LONG') return parseInt(value, 10);
    if (valueType === 'DOUBLE') return parseFloat(value);
    return parseFloat(value); // fallback
}

// Helper function to calculate statistics with more metrics
function calculateEnhancedStatistics(values: number[]): {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    count: number;
    q1: number;
    q3: number;
    iqr: number;
    cv: number;
} {
    if (values.length === 0) {
        return {
            mean: 0,
            median: 0,
            std: 0,
            min: 0,
            max: 0,
            count: 0,
            q1: 0,
            q3: 0,
            iqr: 0,
            cv: 0
        };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    
    // Quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(variance);
    const cv = mean !== 0 ? (std / mean) * 100 : 0; // Coefficient of variation

    return {
        mean,
        median,
        std,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        q1,
        q3,
        iqr,
        cv
    };
}

// Helper function to detect trends
function detectTrends(values: number[], dates: string[]): {
    trend: string;
    trendStrength: number;
    changePercentage: number;
    recentChange: number;
} {
    if (values.length < 3) {
        return {
            trend: 'insufficient_data',
            trendStrength: 0,
            changePercentage: 0,
            recentChange: 0
        };
    }

    // Simple linear regression to detect trend
    const n = values.length;
    const xMean = (n - 1) / 2; // Center x values around mean
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        const x = i - xMean;
        const y = values[i] - yMean;
        numerator += x * y;
        denominator += x * x;
    }
    
    const slope = numerator / denominator;
    const trendStrength = Math.abs(slope) / (Math.max(...values) - Math.min(...values) || 1);
    
    let trend = 'stable';
    if (slope > 0.05) trend = 'increasing';
    else if (slope < -0.05) trend = 'decreasing';
    
    // Calculate change percentage
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    
    // Recent change (last 3 data points vs previous)
    const recentValues = values.slice(-3);
    const previousValues = values.slice(-6, -3);
    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const previousAvg = previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length;
    const recentChange = previousAvg !== 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
        trend,
        trendStrength,
        changePercentage,
        recentChange
    };
}

// Helper function to categorize values
function categorizeValue(value: number, metric: string): {
    category: string;
    interpretation: string;
} {
    const categories = {
        'SleepDuration': {
            'poor': { max: 360, interpretation: 'Insufficient sleep duration' },
            'fair': { min: 361, max: 420, interpretation: 'Below recommended sleep duration' },
            'good': { min: 421, max: 480, interpretation: 'Optimal sleep duration' },
            'excellent': { min: 481, interpretation: 'Above average sleep duration' }
        },
        'SleepEfficiency': {
            'poor': { max: 70, interpretation: 'Significant sleep disturbances' },
            'fair': { min: 71, max: 80, interpretation: 'Some sleep inefficiency' },
            'good': { min: 81, max: 90, interpretation: 'Good sleep efficiency' },
            'excellent': { min: 91, interpretation: 'Excellent sleep efficiency' }
        },
        'Steps': {
            'sedentary': { max: 2500, interpretation: 'Very low activity level' },
            'low_active': { min: 2501, max: 5000, interpretation: 'Below average activity' },
            'somewhat_active': { min: 5001, max: 7500, interpretation: 'Average activity level' },
            'active': { min: 7501, max: 10000, interpretation: 'Good activity level' },
            'highly_active': { min: 10001, interpretation: 'Excellent activity level' }
        },
        'HeartRateResting': {
            'elevated': { min: 80, interpretation: 'Higher than optimal resting heart rate' },
            'slightly_elevated': { min: 70, max: 79, interpretation: 'Slightly above optimal range' },
            'optimal': { min: 60, max: 69, interpretation: 'Optimal resting heart rate' },
            'athlete': { min: 40, max: 59, interpretation: 'Athletic resting heart rate' },
            'very_low': { max: 39, interpretation: 'Very low resting heart rate' }
        },
        'Rmssd': {
            'low': { max: 20, interpretation: 'Low heart rate variability' },
            'moderate': { min: 21, max: 50, interpretation: 'Moderate heart rate variability' },
            'high': { min: 51, max: 100, interpretation: 'Good heart rate variability' },
            'very_high': { min: 101, interpretation: 'Excellent heart rate variability' }
        },
        'BMI': {
            'underweight': { max: 18.5, interpretation: 'Below normal weight range' },
            'normal': { min: 18.6, max: 24.9, interpretation: 'Healthy weight range' },
            'overweight': { min: 25, max: 29.9, interpretation: 'Above normal weight range' },
            'obese': { min: 30, interpretation: 'Obese range' }
        },
        'FatRatio': {
            'low': { max: 15, interpretation: 'Below average body fat percentage' },
            'healthy': { min: 16, max: 25, interpretation: 'Healthy body fat range' },
            'elevated': { min: 26, max: 30, interpretation: 'Above average body fat' },
            'high': { min: 31, interpretation: 'High body fat percentage' }
        }
    };

    const metricCategories = categories[metric as keyof typeof categories];
    if (!metricCategories) {
        return { category: 'unknown', interpretation: 'No categorization available' };
    }

    for (const [category, range] of Object.entries(metricCategories)) {
        const hasMin = 'min' in range;
        const hasMax = 'max' in range;
        
        if ((!hasMin || value >= range.min) && (!hasMax || value <= range.max)) {
            return { category, interpretation: range.interpretation };
        }
    }

    return { category: 'out_of_range', interpretation: 'Value outside expected range' };
}

// Helper function to calculate statistics
function calculateStatistics(values: number[]): {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    count: number;
} {
    if (values.length === 0) {
        return {
            mean: 0,
            median: 0,
            std: 0,
            min: 0,
            max: 0,
            count: 0
        };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(variance);

    return {
        mean,
        median,
        std,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
    };
}

// Helper function to analyze sleep quality
function analyzeSleepQuality(sleepData: any[]): {
    totalSleep: number;
    sleepEfficiency: number;
    remPercentage: number;
    deepPercentage: number;
    lightPercentage: number;
    awakePercentage: number;
    sleepQualityScore: number;
} {
    if (sleepData.length === 0) {
        return {
            totalSleep: 0,
            sleepEfficiency: 0,
            remPercentage: 0,
            deepPercentage: 0,
            lightPercentage: 0,
            awakePercentage: 0,
            sleepQualityScore: 0
        };
    }

    const sleepDuration = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepDuration')?.value || 0;
    const sleepInBed = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepInBedDuration')?.value || 0;
    const remSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepREMDuration')?.value || 0;
    const deepSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepDeepDuration')?.value || 0;
    const lightSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepLightDuration')?.value || 0;
    const awakeSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepAwakeDuration')?.value || 0;

    const totalSleep = convertValue(sleepDuration, 'LONG');
    const totalInBed = convertValue(sleepInBed, 'LONG');
    const rem = convertValue(remSleep, 'LONG');
    const deep = convertValue(deepSleep, 'LONG');
    const light = convertValue(lightSleep, 'LONG');
    const awake = convertValue(awakeSleep, 'LONG');

    const sleepEfficiency = totalInBed > 0 ? (totalSleep / totalInBed) * 100 : 0;
    const totalSleepStages = rem + deep + light + awake;
    
    return {
        totalSleep,
        sleepEfficiency,
        remPercentage: totalSleepStages > 0 ? (rem / totalSleepStages) * 100 : 0,
        deepPercentage: totalSleepStages > 0 ? (deep / totalSleepStages) * 100 : 0,
        lightPercentage: totalSleepStages > 0 ? (light / totalSleepStages) * 100 : 0,
        awakePercentage: totalSleepStages > 0 ? (awake / totalSleepStages) * 100 : 0,
        sleepQualityScore: calculateSleepQualityScore(sleepEfficiency, rem, deep)
    };
}

function calculateSleepQualityScore(efficiency: number, rem: number, deep: number): number {
    // Simple heuristic for sleep quality score (0-100)
    let score = 0;
    
    // Efficiency contributes 40% (optimal: 85-95%)
    const efficiencyScore = Math.min(100, Math.max(0, (efficiency - 70) * 2));
    
    // REM sleep contributes 30% (optimal: 20-25% of total sleep)
    const remPercentage = efficiency > 0 ? (rem / (efficiency * 10)) : 0;
    const remScore = Math.min(100, Math.max(0, (remPercentage - 15) * 5));
    
    // Deep sleep contributes 30% (optimal: 13-23% of total sleep)
    const deepPercentage = efficiency > 0 ? (deep / (efficiency * 10)) : 0;
    const deepScore = Math.min(100, Math.max(0, (deepPercentage - 10) * 3.33));
    
    score = (efficiencyScore * 0.4) + (remScore * 0.3) + (deepScore * 0.3);
    return Math.round(score);
}

// Helper function to analyze activity levels
function analyzeActivityLevels(activityData: any[]): {
    steps: number;
    activeCalories: number;
    totalCalories: number;
    distance: number;
    activityScore: number;
} {
    const stepsData = activityData.find(d => d.dailyDynamicValueTypeName === 'Steps')?.value || '0';
    const activeCaloriesData = activityData.find(d => d.dailyDynamicValueTypeName === 'ActiveBurnedCalories')?.value || '0';
    const totalCaloriesData = activityData.find(d => d.dailyDynamicValueTypeName === 'BurnedCalories')?.value || '0';
    const distanceData = activityData.find(d => d.dailyDynamicValueTypeName === 'CoveredDistance')?.value || '0';

    return {
        steps: convertValue(stepsData, 'LONG'),
        activeCalories: convertValue(activeCaloriesData, 'LONG'),
        totalCalories: convertValue(totalCaloriesData, 'LONG'),
        distance: convertValue(distanceData, 'DOUBLE'),
        activityScore: calculateActivityScore(
            convertValue(stepsData, 'LONG'),
            convertValue(activeCaloriesData, 'LONG')
        )
    };
}

function calculateActivityScore(steps: number, activeCalories: number): number {
    // Simple heuristic for activity score (0-100)
    let score = 0;
    
    // Steps contribution (optimal: 8,000-12,000)
    const stepScore = Math.min(100, Math.max(0, (steps / 10000) * 100));
    
    // Active calories contribution (optimal: 300-600)
    const calorieScore = Math.min(100, Math.max(0, (activeCalories / 500) * 100));
    
    // Combined score
    score = (stepScore * 0.6) + (calorieScore * 0.4);
    return Math.round(score);
}

// Helper function to analyze heart rate data
function analyzeHeartRate(heartRateData: any[]): {
    restingHR: number;
    averageHR: number;
    maxHR: number;
    minHR: number;
    hrVariability: number;
    cardiovascularScore: number;
} {
    const restingHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRateResting')?.value || '0';
    const averageHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRate')?.value || '0';
    const maxHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRate')?.value || '0';
    const minHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRate')?.value || '0';
    const rmssdData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'Rmssd')?.value || '0';

    return {
        restingHR: convertValue(restingHRData, 'LONG'),
        averageHR: convertValue(averageHRData, 'LONG'),
        maxHR: convertValue(maxHRData, 'LONG'),
        minHR: convertValue(minHRData, 'LONG'),
        hrVariability: convertValue(rmssdData, 'DOUBLE'),
        cardiovascularScore: calculateCardiovascularScore(
            convertValue(restingHRData, 'LONG'),
            convertValue(rmssdData, 'DOUBLE')
        )
    };
}

function calculateCardiovascularScore(restingHR: number, rmssd: number): number {
    // Simple heuristic for cardiovascular score (0-100)
    let score = 0;
    
    // Resting HR contribution (optimal: 40-60 bpm)
    const hrScore = Math.min(100, Math.max(0, 100 - ((restingHR - 40) * 2)));
    
    // HRV contribution (optimal: 40-60 ms for RMSSD)
    const hrvScore = Math.min(100, Math.max(0, (rmssd / 60) * 100));
    
    // Combined score
    score = (hrScore * 0.5) + (hrvScore * 0.5);
    return Math.round(score);
}

// Main analysis function
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from query string
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || '2025-01-31';
    const analysisType = searchParams.get('analysisType') || 'comprehensive'; // 'comprehensive', 'sleep', 'activity', 'cardiovascular'
    
    // Validate required parameters
    if (!userId) {
        return NextResponse.json(
            { error: 'userId parameter is required' },
            { status: 400 }
        );
    }
    
    // Validate userId is in the allowed list
    const allowedUserIds = [
        "a463e0bf26d790d6afdfda0cfd161cf5",
        "2bfaa7e6f9455ceafa0a59fd5b80496c",
        "7f82fc3b0abba3a86b5e15c911fc5f6e",
        "65b1357f1ceb98f51de05d1cbeb81532",
        "1e2e53da12e0a9aebb3750af3c5857e1",
        "26158117728afa6083c58c958eed5d89",
        "eb634efc4ac80c9ed6a355c8a99adb83",
        "79187771a36482f013203b32712e873d",
    ];
    
    if (!allowedUserIds.includes(userId)) {
        return NextResponse.json(
            { error: 'Invalid userId' },
            { status: 403 }
        );
    }
    
    try {
        // Fetch data from our own API endpoint
        const fetchUrl = `http://localhost:3000/api/fetch_data?userId=${userId}&dataType=daily&startDate=${startDate}&endDate=${endDate}`;
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch data: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }
        
        const rawData = await response.json();
        
        // Extract the actual data array
        const dataArray = rawData[0]?.dataSources?.[0]?.data || [];
        
        if (dataArray.length === 0) {
            return NextResponse.json(
                { error: 'No data available for the specified date range' },
                { status: 404 }
            );
        }
        
        // Organize data by category
        const sleepData = dataArray.filter(item => 
            item.dailyDynamicValueTypeName.includes('Sleep') && 
            !item.dailyDynamicValueTypeName.includes('Binary')
        );
        
        const activityData = dataArray.filter(item => 
            ['Steps', 'BurnedCalories', 'ActiveBurnedCalories', 'CoveredDistance', 'ActivityDuration'].includes(item.dailyDynamicValueTypeName)
        );
        
        const heartRateData = dataArray.filter(item => 
            ['HeartRate', 'HeartRateResting', 'Rmssd'].includes(item.dailyDynamicValueTypeName)
        );
        
        const bodyCompositionData = dataArray.filter(item => 
            ['Weight', 'BMI', 'FatRatio', 'MuscleMass', 'BodyTemperature'].includes(item.dailyDynamicValueTypeName)
        );
        
        // Perform analysis based on requested type
        let analysisResult = {};
        
        switch (analysisType) {
            case 'sleep':
                analysisResult = {
                    sleepAnalysis: analyzeSleepQuality(sleepData),
                    period: `${startDate} to ${endDate}`
                };
                break;
                
            case 'activity':
                analysisResult = {
                    activityAnalysis: analyzeActivityLevels(activityData),
                    period: `${startDate} to ${endDate}`
                };
                break;
                
            case 'cardiovascular':
                analysisResult = {
                    cardiovascularAnalysis: analyzeHeartRate(heartRateData),
                    period: `${startDate} to ${endDate}`
                };
                break;
                
            case 'comprehensive':
            default:
                analysisResult = {
                    sleepAnalysis: analyzeSleepQuality(sleepData),
                    activityAnalysis: analyzeActivityLevels(activityData),
                    cardiovascularAnalysis: analyzeHeartRate(heartRateData),
                    bodyComposition: bodyCompositionData.length > 0 ? {
                        weight: convertValue(bodyCompositionData.find(d => d.dailyDynamicValueTypeName === 'Weight')?.value || '0', 'DOUBLE'),
                        bmi: convertValue(bodyCompositionData.find(d => d.dailyDynamicValueTypeName === 'BMI')?.value || '0', 'DOUBLE'),
                        fatRatio: convertValue(bodyCompositionData.find(d => d.dailyDynamicValueTypeName === 'FatRatio')?.value || '0', 'LONG'),
                        muscleMass: convertValue(bodyCompositionData.find(d => d.dailyDynamicValueTypeName === 'MuscleMass')?.value || '0', 'DOUBLE'),
                        bodyTemp: convertValue(bodyCompositionData.find(d => d.dailyDynamicValueTypeName === 'BodyTemperature')?.value || '0', 'DOUBLE')
                    } : null,
                    overallHealthScore: calculateOverallHealthScore(
                        analyzeSleepQuality(sleepData).sleepQualityScore,
                        analyzeActivityLevels(activityData).activityScore,
                        analyzeHeartRate(heartRateData).cardiovascularScore
                    ),
                    period: `${startDate} to ${endDate}`,
                    dataPoints: dataArray.length
                };
        }
        
        return NextResponse.json({
            success: true,
            userId,
            analysisType,
            ...analysisResult
        });
        
    } catch (error) {
        return NextResponse.json(
            { error: `Analysis failed: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}

function calculateOverallHealthScore(sleepScore: number, activityScore: number, cardiovascularScore: number): {
    score: number;
    category: string;
    recommendations: string[];
} {
    // Weighted average: sleep 30%, activity 30%, cardiovascular 40%
    const score = Math.round(
        (sleepScore * 0.3) + 
        (activityScore * 0.3) + 
        (cardiovascularScore * 0.4)
    );
    
    let category = '';
    let recommendations: string[] = [];
    
    if (score >= 85) {
        category = 'Excellent';
        recommendations = [
            'Maintain your current healthy lifestyle',
            'Continue with regular exercise and sleep routines',
            'Monitor for any significant changes in metrics'
        ];
    } else if (score >= 70) {
        category = 'Good';
        recommendations = [
            'Consider small improvements in sleep quality',
            'Increase daily activity levels slightly',
            'Monitor cardiovascular metrics regularly'
        ];
    } else if (score >= 55) {
        category = 'Fair';
        recommendations = [
            'Focus on improving sleep consistency',
            'Increase moderate to vigorous physical activity',
            'Consider stress reduction techniques',
            'Monitor heart rate variability and resting heart rate'
        ];
    } else {
        category = 'Needs Improvement';
        recommendations = [
            'Consult with healthcare professional',
            'Establish regular sleep schedule',
            'Incorporate regular exercise routine',
            'Monitor cardiovascular health closely',
            'Consider dietary improvements'
        ];
    }
    
    return {
        score,
        category,
        recommendations
    };
}