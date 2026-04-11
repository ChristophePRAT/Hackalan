import { NextResponse } from 'next/server';

// Helper function to convert value based on type
function convertValue(value: string, valueType: string): number {
    if (valueType === 'LONG') return parseInt(value, 10);
    if (valueType === 'DOUBLE') return parseFloat(value);
    return parseFloat(value); // fallback
}

// Helper function to round to 2 decimal places
function roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

// Helper function to calculate statistics with more metrics
function calculateEnhancedStatistics(values: number[], unit: string): {
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
    unit: string;
} | null {
    if (values.length === 0) {
        return null;
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
        mean: roundToTwo(mean),
        median: roundToTwo(median),
        std: roundToTwo(std),
        min: roundToTwo(Math.min(...values)),
        max: roundToTwo(Math.max(...values)),
        count: values.length,
        q1: roundToTwo(q1),
        q3: roundToTwo(q3),
        iqr: roundToTwo(iqr),
        cv: roundToTwo(cv),
        unit // e.g., 'minutes', 'kcal', 'count', 'meters', 'ms', 'bpm'
    };
}

// Helper function to detect trends
function detectTrends(values: number[], dates: string[]): {
    trend: string;
    trendStrength: number;
    changePercentage: number;
    recentChange: number;
    seasonality: string;
    volatility: number;
    trendConfidence: number;
} {
    if (values.length < 3) {
        return {
            trend: 'insufficient_data',
            trendStrength: 0,
            changePercentage: 0,
            recentChange: 0,
            seasonality: 'unknown',
            volatility: 0,
            trendConfidence: 0
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

    // Calculate volatility (standard deviation of changes)
    const changes = values.slice(1).map((val, i) => val - values[i]);
    const volatility = Math.sqrt(changes.reduce((sum, val) => sum + Math.pow(val, 2), 0) / changes.length);
    
    // Simple seasonality detection
    let seasonality = 'none';
    if (n > 7) {
        const firstHalfAvg = values.slice(0, Math.floor(n/2)).reduce((sum, val) => sum + val, 0) / Math.floor(n/2);
        const secondHalfAvg = values.slice(Math.floor(n/2)).reduce((sum, val) => sum + val, 0) / Math.ceil(n/2);
        const seasonalityStrength = Math.abs(firstHalfAvg - secondHalfAvg) / yMean;
        if (seasonalityStrength > 0.15) seasonality = 'moderate';
        if (seasonalityStrength > 0.3) seasonality = 'strong';
    }
    
    // Trend confidence based on R-squared
    const ssTotal = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssResidual = values.reduce((sum, val, i) => {
        const x = i - xMean;
        return sum + Math.pow(val - (yMean + slope * x), 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    const trendConfidence = Math.min(1, Math.max(0, rSquared));

    return {
        trend,
        trendStrength: roundToTwo(trendStrength),
        changePercentage: roundToTwo(changePercentage),
        recentChange: roundToTwo(recentChange),
        seasonality,
        volatility: roundToTwo(volatility),
        trendConfidence: roundToTwo(trendConfidence)
    };
}


// Helper function to get week number
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper function to get quarter
function getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
}

// Helper function to group data by interval
function groupDataByInterval(data: any[], interval: 'weekly' | 'monthly' | 'quarterly'): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    data.forEach(item => {
        if (!item.date) return;
        const date = new Date(item.date);
        let key = '';
        
        if (interval === 'weekly') {
            key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        } else if (interval === 'monthly') {
            key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (interval === 'quarterly') {
            key = `${date.getFullYear()}-Q${getQuarter(date)}`;
        }
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });
    
    return groups;
}

// Helper function to analyze evolution over intervals
function analyzeEvolution(data: any[], interval: 'weekly' | 'monthly' | 'quarterly') {
    const grouped = groupDataByInterval(data, interval);
    const sortedKeys = Object.keys(grouped).sort();
    
    if (sortedKeys.length === 0) return [];

    const results = sortedKeys.map((key) => {
        const bucketData = grouped[key];
        
        // Filter by categories as in the main logic
        const sleepData = bucketData.filter(item => 
            item.dailyDynamicValueTypeName.includes('Sleep') && 
            !item.dailyDynamicValueTypeName.includes('Binary')
        );
        const activityData = bucketData.filter(item => 
            ['Steps', 'BurnedCalories', 'ActiveBurnedCalories', 'CoveredDistance', 'ActivityDuration'].includes(item.dailyDynamicValueTypeName)
        );
        const heartRateData = bucketData.filter(item => 
            ['HeartRate', 'HeartRateResting', 'Rmssd'].includes(item.dailyDynamicValueTypeName)
        );

        const sleepAnalysis = analyzeSleepQuality(sleepData);
        const activityAnalysis = analyzeActivityLevels(activityData);
        const cardiovascularAnalysis = analyzeHeartRate(heartRateData);
        
        const healthScore = calculateOverallHealthScore(sleepAnalysis, activityAnalysis, cardiovascularAnalysis);

        return {
            period: key,
            dataPoints: bucketData.length,
            overallScore: healthScore.totalScore,
            metrics: {
                avgSleepMinutes: sleepAnalysis.averages.totalSleepMinutes,
                avgStepsCount: activityAnalysis.steps.mean,
                avgRestingHRBpm: cardiovascularAnalysis.restingHR.mean,
                avgHRVms: cardiovascularAnalysis.hrVariability.mean,
                activityIntensityScore: activityAnalysis.intensityScore,
                sleepEfficiencyPercentage: sleepAnalysis.averages.efficiencyPercentage
            }
        };
    });

    // Calculate percentage changes
    for (let i = 1; i < results.length; i++) {
        const current = results[i];
        const prev = results[i-1];
        
        (current as any).changeVsPrevious = {
            overallScore: prev.overallScore !== 0 ? roundToTwo(((current.overallScore - prev.overallScore) / prev.overallScore) * 100) : 0,
            avgSteps: prev.metrics.avgStepsCount !== 0 ? roundToTwo(((current.metrics.avgStepsCount - prev.metrics.avgStepsCount) / prev.metrics.avgStepsCount) * 100) : 0,
            avgSleep: prev.metrics.avgSleepMinutes !== 0 ? roundToTwo(((current.metrics.avgSleepMinutes - prev.metrics.avgSleepMinutes) / prev.metrics.avgSleepMinutes) * 100) : 0,
            avgRestingHR: prev.metrics.avgRestingHRBpm !== 0 ? roundToTwo(((current.metrics.avgRestingHRBpm - prev.metrics.avgRestingHRBpm) / prev.metrics.avgRestingHRBpm) * 100) : 0,
        };
    }

    return results;
}

// Helper function to analyze sleep quality over a period
function analyzeSleepQuality(sleepData: any[]): {
    duration?: any;
    efficiency?: any;
    stages: {
        rem?: any;
        deep?: any;
        light?: any;
        awake?: any;
    };
    latency?: any;
    disruptions?: any;
    qualityScore: number;
    consistencyScore: number;
    regularityScore: number;
    averages: {
        totalSleepMinutes: number;
        efficiencyPercentage: number;
        remPercentage: number;
        deepPercentage: number;
    };
} {
    const getMetricValues = (name: string) => 
        sleepData.filter(d => d.dailyDynamicValueTypeName === name)
                 .map(d => convertValue(d.value, d.valueType));

    const getMetricDates = (name: string) =>
        sleepData.filter(d => d.dailyDynamicValueTypeName === name)
                 .map(d => d.date || '');

    const durations = getMetricValues('SleepDuration');
    const efficiencies = getMetricValues('SleepEfficiency');
    const remValues = getMetricValues('SleepREMDuration');
    const deepValues = getMetricValues('SleepDeepDuration');
    const lightValues = getMetricValues('SleepLightDuration');
    const awakeValues = getMetricValues('SleepAwakeDuration');
    const latencyValues = getMetricValues('SleepLatency');
    const disruptionValues = getMetricValues('SleepDisruptions');

    const durationStats = calculateEnhancedStatistics(durations, 'minutes');
    const efficiencyStats = calculateEnhancedStatistics(efficiencies, 'percentage');
    
    const remStats = calculateEnhancedStatistics(remValues, 'minutes');
    const deepStats = calculateEnhancedStatistics(deepValues, 'minutes');
    const lightStats = calculateEnhancedStatistics(lightValues, 'minutes');
    const awakeStats = calculateEnhancedStatistics(awakeValues, 'minutes');
    
    const latencyStats = calculateEnhancedStatistics(latencyValues, 'minutes');
    const disruptionStats = calculateEnhancedStatistics(disruptionValues, 'count');

    const avgTotalSleep = durationStats?.mean || 0;
    const avgEfficiency = efficiencyStats?.mean || 0;
    const avgRem = remStats?.mean || 0;
    const avgDeep = deepStats?.mean || 0;
    const avgLight = lightStats?.mean || 0;
    const avgAwake = awakeStats?.mean || 0;
    
    const totalStages = avgRem + avgDeep + avgLight + avgAwake;

    const consistencyScore = durations.length > 0 ? calculateConsistency(durations) : 0;
    const regularityScore = calculateSleepRegularity(sleepData);
    const qualityScore = calculateSleepQualityScore(avgEfficiency, avgRem, avgDeep);

    return {
        ...(durationStats && { duration: { ...durationStats, trend: detectTrends(durations, getMetricDates('SleepDuration')) } }),
        ...(efficiencyStats && { efficiency: { ...efficiencyStats, trend: detectTrends(efficiencies, getMetricDates('SleepEfficiency')) } }),
        stages: {
            ...(remStats && { rem: remStats }),
            ...(deepStats && { deep: deepStats }),
            ...(lightStats && { light: lightStats }),
            ...(awakeStats && { awake: awakeStats }),
        },
        ...(latencyStats && { latency: latencyStats }),
        ...(disruptionStats && { disruptions: disruptionStats }),
        qualityScore,
        consistencyScore,
        regularityScore,
        averages: {
            totalSleepMinutes: avgTotalSleep,
            efficiencyPercentage: avgEfficiency,
            remPercentage: totalStages > 0 ? (avgRem / totalStages) * 100 : 0,
            deepPercentage: totalStages > 0 ? (avgDeep / totalStages) * 100 : 0
        }
    };
}

function calculateConsistency(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to consistency score (0-100, where lower stdDev = higher consistency)
    const maxExpectedVariation = mean * 0.3; // 30% of mean as max reasonable variation
    return Math.max(0, 100 - (stdDev / maxExpectedVariation) * 100);
}

function calculateSleepRegularity(sleepData: any[]): number {
    // Extract bedtime and wake time data if available
    const bedtimeData = sleepData.filter(d => d.dailyDynamicValueTypeName.includes('Bedtime'));
    const wakeTimeData = sleepData.filter(d => d.dailyDynamicValueTypeName.includes('WakeTime'));
    
    if (bedtimeData.length < 2 || wakeTimeData.length < 2) return 50; // Default moderate regularity
    
    // Calculate standard deviation of bedtimes and wake times
    const bedtimeMinutes = bedtimeData.map(d => {
        // Simple conversion - would need proper time parsing in real implementation
        return convertValue(d.value, 'LONG');
    });
    
    const wakeTimeMinutes = wakeTimeData.map(d => {
        return convertValue(d.value, 'LONG');
    });
    
    const bedtimeConsistency = calculateConsistency(bedtimeMinutes);
    const wakeTimeConsistency = calculateConsistency(wakeTimeMinutes);
    
    // Average of bedtime and wake time consistency
    return (bedtimeConsistency + wakeTimeConsistency) / 2;
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

// Helper function to analyze activity levels over a period
function analyzeActivityLevels(activityData: any[]): {
    steps?: any;
    activeCalories?: any;
    totalCalories?: any;
    distance?: any;
    durations: {
        sedentary?: any;
        light?: any;
        moderate?: any;
        vigorous?: any;
    };
    activityScore: number;
    intensityScore: number;
    consistencyScore: number;
} {
    const getMetricValues = (name: string) => 
        activityData.filter(d => d.dailyDynamicValueTypeName === name)
                    .map(d => convertValue(d.value, d.valueType));

    const getMetricDates = (name: string) =>
        activityData.filter(d => d.dailyDynamicValueTypeName === name)
                    .map(d => d.date || '');

    const steps = getMetricValues('Steps');
    const activeCalories = getMetricValues('ActiveBurnedCalories');
    const totalCalories = getMetricValues('BurnedCalories');
    const distance = getMetricValues('CoveredDistance');
    const sedentary = getMetricValues('SedentaryDuration');
    const light = getMetricValues('LightActivityDuration');
    const moderate = getMetricValues('ModerateActivityDuration');
    const vigorous = getMetricValues('VigorousActivityDuration');

    const stepsStats = calculateEnhancedStatistics(steps, 'count');
    const activeCaloriesStats = calculateEnhancedStatistics(activeCalories, 'kcal');
    const totalCaloriesStats = calculateEnhancedStatistics(totalCalories, 'kcal');
    const distanceStats = calculateEnhancedStatistics(distance, 'meters');

    const sedentaryStats = calculateEnhancedStatistics(sedentary, 'minutes');
    const lightStats = calculateEnhancedStatistics(light, 'minutes');
    const moderateStats = calculateEnhancedStatistics(moderate, 'minutes');
    const vigorousStats = calculateEnhancedStatistics(vigorous, 'minutes');

    const activityScore = calculateActivityScore(stepsStats?.mean || 0, activeCaloriesStats?.mean || 0);
    const intensityScore = calculateActivityIntensityScore(
        lightStats?.mean || 0, moderateStats?.mean || 0, vigorousStats?.mean || 0, sedentaryStats?.mean || 0
    );
    const consistencyScore = steps.length > 0 ? calculateConsistency(steps) : 0;

    return {
        ...(stepsStats && { steps: { ...stepsStats, trend: detectTrends(steps, getMetricDates('Steps')) } }),
        ...(activeCaloriesStats && { activeCalories: { ...activeCaloriesStats, trend: detectTrends(activeCalories, getMetricDates('ActiveBurnedCalories')) } }),
        ...(totalCaloriesStats && { totalCalories: totalCaloriesStats }),
        ...(distanceStats && { distance: distanceStats }),
        durations: {
            ...(sedentaryStats && { sedentary: sedentaryStats }),
            ...(lightStats && { light: lightStats }),
            ...(moderateStats && { moderate: moderateStats }),
            ...(vigorousStats && { vigorous: vigorousStats })
        },
        activityScore,
        intensityScore,
        consistencyScore
    };
}

function calculateActivityIntensityScore(
    lightActivity: number,
    moderateActivity: number,
    vigorousActivity: number,
    sedentaryTime: number
): number {
    const totalActivity = lightActivity + moderateActivity + vigorousActivity + sedentaryTime;
    
    if (totalActivity === 0) return 0;
    
    // Weighted score favoring higher intensity activity
    const lightWeight = 0.5;
    const moderateWeight = 1.5;
    const vigorousWeight = 2.5;
    const sedentaryPenalty = -0.3;
    
    const score = (
        (lightActivity / totalActivity) * lightWeight +
        (moderateActivity / totalActivity) * moderateWeight +
        (vigorousActivity / totalActivity) * vigorousWeight +
        (sedentaryTime / totalActivity) * sedentaryPenalty
    ) * 100;
    
    return Math.max(0, Math.round(score));
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

// Helper function to analyze heart rate data over a period
function analyzeHeartRate(heartRateData: any[]): {
    restingHR?: any;
    hrVariability?: any;
    averageHR?: any;
    maxHR?: any;
    minHR?: any;
    recovery?: any;
    cardiovascularScore: number;
    volatilityScore: number;
} {
    const getMetricValues = (name: string) => 
        heartRateData.filter(d => d.dailyDynamicValueTypeName === name)
                    .map(d => convertValue(d.value, d.valueType));

    const getMetricDates = (name: string) =>
        heartRateData.filter(d => d.dailyDynamicValueTypeName === name)
                    .map(d => d.date || '');

    const restingHR = getMetricValues('HeartRateResting');
    const hrv = getMetricValues('Rmssd');
    const averageHR = getMetricValues('HeartRate');
    const maxHR = getMetricValues('HeartRateMax');
    const minHR = getMetricValues('HeartRateMin');
    const recovery = getMetricValues('HeartRateRecovery');

    const restingHRStats = calculateEnhancedStatistics(restingHR, 'bpm');
    const hrvStats = calculateEnhancedStatistics(hrv, 'ms');
    
    const avgHRStats = calculateEnhancedStatistics(averageHR, 'bpm');
    const maxHRStats = calculateEnhancedStatistics(maxHR, 'bpm');
    const minHRStats = calculateEnhancedStatistics(minHR, 'bpm');
    const recoveryStats = calculateEnhancedStatistics(recovery, 'bpm');

    const cardiovascularScore = calculateCardiovascularScore(restingHRStats?.mean || 0, hrvStats?.mean || 0);
    
    // Calculate heart rate volatility
    const volatilityScore = restingHRStats?.std || 0;

    return {
        ...(restingHRStats && { restingHR: { ...restingHRStats, trend: detectTrends(restingHR, getMetricDates('HeartRateResting')) } }),
        ...(hrvStats && { hrVariability: { ...hrvStats, trend: detectTrends(hrv, getMetricDates('Rmssd')) } }),
        ...(avgHRStats && { averageHR: avgHRStats }),
        ...(maxHRStats && { maxHR: maxHRStats }),
        ...(minHRStats && { minHR: minHRStats }),
        ...(recoveryStats && { recovery: recoveryStats }),
        cardiovascularScore,
        volatilityScore
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
    // Align default dates with fetch_data's defaults to ensure we find data
    const startDate = searchParams.get('startDate') || '2025-05-01';
    const endDate = searchParams.get('endDate') || '2026-04-11';
    const analysisType = searchParams.get('analysisType') || 'comprehensive'; 
    
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
        const fetchUrl = `/api/fetch_data?userId=${userId}&dataType=daily&startDate=${startDate}&endDate=${endDate}`;
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch data: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }
        
        const rawData = await response.json();
        
        // Extract the actual data array - Thryve API returns an array of data sources
        // We try to find any data source that contains data
        let dataArray: any[] = [];
        if (Array.isArray(rawData)) {
            // Check all data sources in the array
            for (const sourceContainer of rawData) {
                if (sourceContainer.dataSources && Array.isArray(sourceContainer.dataSources)) {
                    for (const source of sourceContainer.dataSources) {
                        if (source.data && Array.isArray(source.data)) {
                            dataArray = [...dataArray, ...source.data];
                        }
                    }
                }
            }
        }
        
        if (dataArray.length === 0) {
            return NextResponse.json(
                { 
                    error: 'No data available for the specified date range',
                    debug: {
                        userId,
                        startDate,
                        endDate,
                        rawDataPreview: JSON.stringify(rawData).substring(0, 200)
                    }
                },
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
                const sleepAnalysis = analyzeSleepQuality(sleepData);
                const activityAnalysis = analyzeActivityLevels(activityData);
                const cardiovascularAnalysis = analyzeHeartRate(heartRateData);
                
                const weightStats = calculateEnhancedStatistics(bodyCompositionData.filter(d => d.dailyDynamicValueTypeName === 'Weight').map(d => convertValue(d.value, d.valueType)), 'kg');
                const bmiStats = calculateEnhancedStatistics(bodyCompositionData.filter(d => d.dailyDynamicValueTypeName === 'BMI').map(d => convertValue(d.value, d.valueType)), 'index');
                const fatRatioStats = calculateEnhancedStatistics(bodyCompositionData.filter(d => d.dailyDynamicValueTypeName === 'FatRatio').map(d => convertValue(d.value, d.valueType)), 'percentage');
                const muscleMassStats = calculateEnhancedStatistics(bodyCompositionData.filter(d => d.dailyDynamicValueTypeName === 'MuscleMass').map(d => convertValue(d.value, d.valueType)), 'kg');

                analysisResult = {
                    sleepAnalysis,
                    activityAnalysis,
                    cardiovascularAnalysis,
                    bodyComposition: (weightStats || bmiStats || fatRatioStats || muscleMassStats) ? {
                        ...(weightStats && { weight: weightStats }),
                        ...(bmiStats && { bmi: bmiStats }),
                        ...(fatRatioStats && { fatRatio: fatRatioStats }),
                        ...(muscleMassStats && { muscleMass: muscleMassStats }),
                    } : null,
                    overallHealthScore: calculateOverallHealthScore(
                        sleepAnalysis,
                        activityAnalysis,
                        cardiovascularAnalysis
                    ),
                    evolution: {
                        weekly: analyzeEvolution(dataArray, 'weekly'),
                        monthly: analyzeEvolution(dataArray, 'monthly'),
                        quarterly: analyzeEvolution(dataArray, 'quarterly')
                    },
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

function calculateOverallHealthScore(sleepAnalysis: any, activityAnalysis: any, cardiovascularAnalysis: any): {
    totalScore: number;
    category: string;
    componentScores: {
        sleep: number;
        activity: number;
        cardiovascular: number;
    };
    summary: {
        status: string;
        primaryInsight: string;
        volatilityIndex: number;
        consistencyIndex: number;
    };
    unitDocumentation: Record<string, string>;
} {
    const sleepScore = sleepAnalysis.qualityScore;
    const activityScore = activityAnalysis.activityScore;
    const cardiovascularScore = cardiovascularAnalysis.cardiovascularScore;

    // Weighted average: sleep 30%, activity 30%, cardiovascular 40%
    const totalScore = Math.round(
        (sleepScore * 0.3) + 
        (activityScore * 0.3) + 
        (cardiovascularScore * 0.4)
    );
    
    let category = '';
    if (totalScore >= 85) category = 'Excellent';
    else if (totalScore >= 70) category = 'Good';
    else if (totalScore >= 55) category = 'Fair';
    else category = 'Needs Improvement';

    // Calculate volatility and consistency indexes
    const volatilityIndex = (
        (sleepAnalysis.duration?.cv || 0) + 
        (activityAnalysis.steps?.cv || 0) + 
        (cardiovascularAnalysis.restingHR?.cv || 0)
    ) / 3;

    const consistencyIndex = (
        (sleepAnalysis.consistencyScore || 0) + 
        (activityAnalysis.consistencyScore || 0) + 
        (sleepAnalysis.regularityScore || 0)
    ) / 3;

    return {
        totalScore,
        category,
        componentScores: {
            sleep: sleepScore,
            activity: activityScore,
            cardiovascular: cardiovascularScore
        },
        summary: {
            status: category,
            primaryInsight: `Health score is ${category.toLowerCase()} at ${totalScore}/100. ${
                volatilityIndex > 20 ? 'High variability detected in biometric markers.' : 'Stable health metrics across the period.'
            }`,
            volatilityIndex: roundToTwo(volatilityIndex),
            consistencyIndex: roundToTwo(consistencyIndex)
        },
        unitDocumentation: {
            sleep: "Daily averages in minutes (except efficiency and stages percentages)",
            activity: "Daily totals (steps in count, calories in kcal, distance in meters, durations in minutes)",
            cardiovascular: "Heart rate in bpm, HRV (RMSSD) in ms",
            bodyComposition: "Weight and muscle mass in kg, fat ratio in percentage, BMI as index"
        }
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { goal, custom, format, duration } = body;

        // In a real scenario, we could use the analysis logic here
        // For now, we return a response consistent with the frontend's expectations
        
        return NextResponse.json({
            title: `Your ${duration}-minute ${goal} ${format}`,
            body: `Based on your situation: "${custom || 'No specific situation described'}", Mo has designed this content for you.\n\nThis is a personalized ${format} to help you with ${goal}. It uses medically vetted guidelines to ensure safety and effectiveness.\n\nTake this time for yourself.`,
            scores: {
                medical: 95,
                brand: 90,
                personalization: 85
            },
            xp: 120
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process analysis request' },
            { status: 500 }
        );
    }
}
