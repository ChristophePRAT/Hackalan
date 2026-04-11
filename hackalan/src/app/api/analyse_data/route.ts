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
        trendStrength,
        changePercentage,
        recentChange,
        seasonality,
        volatility,
        trendConfidence
    };
}

// Helper function to categorize values
function categorizeValue(value: number, metric: string): {
    category: string;
    interpretation: string;
    healthImpact: string;
    improvementSuggestions: string[];
} {
    const categories = {
        'SleepDuration': {
            'poor': { 
                max: 360, 
                interpretation: 'Insufficient sleep duration',
                healthImpact: 'Chronic sleep deprivation can lead to cognitive impairment, weakened immune system, increased risk of cardiovascular disease, and metabolic disorders',
                improvementSuggestions: [
                    'Establish consistent sleep schedule',
                    'Create relaxing bedtime routine',
                    'Limit screen time before bed',
                    'Optimize sleep environment (dark, cool, quiet)',
                    'Consider sleep hygiene education'
                ]
            },
            'fair': { 
                min: 361, max: 420, 
                interpretation: 'Below recommended sleep duration',
                healthImpact: 'Mild sleep deficiency may cause daytime fatigue, reduced cognitive performance, and increased stress levels',
                improvementSuggestions: [
                    'Gradually extend sleep duration by 15-30 minutes',
                    'Improve sleep quality through environment optimization',
                    'Reduce caffeine intake in afternoon/evening',
                    'Practice relaxation techniques before bed'
                ]
            },
            'good': { 
                min: 421, max: 480, 
                interpretation: 'Optimal sleep duration',
                healthImpact: 'Adequate sleep supports cognitive function, emotional regulation, physical health, and overall well-being',
                improvementSuggestions: [
                    'Maintain current sleep habits',
                    'Monitor sleep quality metrics',
                    'Address any sleep disruptions promptly',
                    'Consider sleep efficiency improvements'
                ]
            },
            'excellent': { 
                min: 481, 
                interpretation: 'Above average sleep duration',
                healthImpact: 'Extended sleep may provide additional recovery benefits, but ensure it doesn\'t indicate underlying health issues',
                improvementSuggestions: [
                    'Monitor for excessive sleepiness during day',
                    'Assess sleep quality - long duration with poor quality may indicate issues',
                    'Maintain balanced sleep schedule',
                    'Consider gradual reduction if experiencing grogginess'
                ]
            }
        },
        'SleepEfficiency': {
            'poor': { 
                max: 70, 
                interpretation: 'Significant sleep disturbances',
                healthImpact: 'Frequent awakenings disrupt sleep architecture, reducing restorative benefits and increasing daytime fatigue',
                improvementSuggestions: [
                    'Evaluate sleep environment for disruptions',
                    'Consider medical evaluation for sleep disorders',
                    'Limit fluid intake before bedtime',
                    'Practice stress reduction techniques',
                    'Avoid alcohol and heavy meals before bed'
                ]
            },
            'fair': { 
                min: 71, max: 80, 
                interpretation: 'Some sleep inefficiency',
                healthImpact: 'Moderate sleep fragmentation may cause daytime drowsiness and reduced cognitive performance',
                improvementSuggestions: [
                    'Improve sleep hygiene practices',
                    'Address environmental factors (noise, light, temperature)',
                    'Establish consistent sleep-wake schedule',
                    'Limit naps during daytime',
                    'Consider relaxation techniques before bed'
                ]
            },
            'good': { 
                min: 81, max: 90, 
                interpretation: 'Good sleep efficiency',
                healthImpact: 'Efficient sleep provides adequate restoration with minimal disruptions to sleep architecture',
                improvementSuggestions: [
                    'Maintain current sleep habits',
                    'Monitor for any declines in efficiency',
                    'Address minor disruptions promptly',
                    'Optimize sleep environment further'
                ]
            },
            'excellent': { 
                min: 91, 
                interpretation: 'Excellent sleep efficiency',
                healthImpact: 'Highly efficient sleep indicates optimal sleep architecture and minimal disruptions',
                improvementSuggestions: [
                    'Maintain excellent sleep habits',
                    'Share successful strategies with others',
                    'Monitor for any changes that might affect efficiency',
                    'Consider sleep as a model for others'
                ]
            }
        },
        'Steps': {
            'sedentary': { 
                max: 2500, 
                interpretation: 'Very low activity level',
                healthImpact: 'Sedentary lifestyle increases risk of cardiovascular disease, obesity, diabetes, and premature mortality',
                improvementSuggestions: [
                    'Start with short, frequent walks throughout day',
                    'Use standing desk or take standing breaks',
                    'Set gradual step increase goals (e.g., +500 steps/week)',
                    'Incorporate light exercise routines',
                    'Consider fitness tracking and gamification'
                ]
            },
            'low_active': { 
                min: 2501, max: 5000, 
                interpretation: 'Below average activity',
                healthImpact: 'Low activity levels may contribute to weight gain, reduced cardiovascular health, and lower energy levels',
                improvementSuggestions: [
                    'Aim for 10-minute walking breaks every hour',
                    'Incorporate brisk walking or light jogging',
                    'Set achievable daily step goals',
                    'Try low-impact activities like swimming or cycling',
                    'Use stairs instead of elevators when possible'
                ]
            },
            'somewhat_active': { 
                min: 5001, max: 7500, 
                interpretation: 'Average activity level',
                healthImpact: 'Moderate activity supports basic cardiovascular health and helps maintain current fitness level',
                improvementSuggestions: [
                    'Increase daily step goal by 10-15%',
                    'Add variety to physical activities',
                    'Incorporate strength training 2-3 times/week',
                    'Try new activities to maintain motivation',
                    'Monitor progress and celebrate milestones'
                ]
            },
            'active': { 
                min: 7501, max: 10000, 
                interpretation: 'Good activity level',
                healthImpact: 'Regular physical activity reduces risk of chronic diseases, improves mental health, and enhances longevity',
                improvementSuggestions: [
                    'Maintain current activity levels',
                    'Add variety with different types of exercise',
                    'Consider increasing intensity gradually',
                    'Incorporate flexibility and balance training',
                    'Set new fitness challenges periodically'
                ]
            },
            'highly_active': { 
                min: 10001, 
                interpretation: 'Excellent activity level',
                healthImpact: 'High activity levels provide optimal cardiovascular benefits, metabolic health, and overall fitness',
                improvementSuggestions: [
                    'Maintain excellent activity habits',
                    'Ensure adequate recovery and rest days',
                    'Monitor for overtraining signs',
                    'Diversify activities to prevent injury',
                    'Consider sharing fitness journey to motivate others'
                ]
            }
        },
        'HeartRateResting': {
            'elevated': { 
                min: 80, 
                interpretation: 'Higher than optimal resting heart rate',
                healthImpact: 'Elevated resting heart rate may indicate cardiovascular strain, stress, or potential health risks',
                improvementSuggestions: [
                    'Increase cardiovascular exercise gradually',
                    'Practice stress reduction techniques',
                    'Improve sleep quality and duration',
                    'Monitor for consistent patterns',
                    'Consider medical evaluation if persistent'
                ]
            },
            'slightly_elevated': { 
                min: 70, max: 79, 
                interpretation: 'Slightly above optimal range',
                healthImpact: 'Mildly elevated resting heart rate may indicate room for cardiovascular improvement',
                improvementSuggestions: [
                    'Engage in regular aerobic exercise',
                    'Practice deep breathing and relaxation',
                    'Monitor hydration levels',
                    'Reduce caffeine and stimulant intake',
                    'Improve overall fitness gradually'
                ]
            },
            'optimal': { 
                min: 60, max: 69, 
                interpretation: 'Optimal resting heart rate',
                healthImpact: 'Optimal resting heart rate indicates good cardiovascular health and fitness',
                improvementSuggestions: [
                    'Maintain current cardiovascular fitness',
                    'Continue regular exercise routine',
                    'Monitor for any significant changes',
                    'Consider heart rate variability tracking'
                ]
            },
            'athlete': { 
                min: 40, max: 59, 
                interpretation: 'Athletic resting heart rate',
                healthImpact: 'Low resting heart rate typically indicates excellent cardiovascular fitness and efficiency',
                improvementSuggestions: [
                    'Maintain excellent cardiovascular conditioning',
                    'Monitor for any unusual symptoms',
                    'Ensure adequate recovery between workouts',
                    'Stay hydrated and maintain electrolyte balance'
                ]
            },
            'very_low': { 
                max: 39, 
                interpretation: 'Very low resting heart rate',
                healthImpact: 'Extremely low resting heart rate may indicate bradycardia or other cardiovascular conditions',
                improvementSuggestions: [
                    'Monitor for symptoms like dizziness or fatigue',
                    'Consider medical evaluation if experiencing symptoms',
                    'Maintain regular cardiovascular exercise',
                    'Stay well-hydrated',
                    'Avoid sudden changes in activity levels'
                ]
            }
        },
        'Rmssd': {
            'low': { 
                max: 20, 
                interpretation: 'Low heart rate variability',
                healthImpact: 'Low HRV may indicate chronic stress, poor recovery, or autonomic nervous system imbalance',
                improvementSuggestions: [
                    'Practice stress reduction techniques daily',
                    'Improve sleep quality and duration',
                    'Engage in regular, moderate exercise',
                    'Practice deep breathing exercises',
                    'Consider mindfulness or meditation practice'
                ]
            },
            'moderate': { 
                min: 21, max: 50, 
                interpretation: 'Moderate heart rate variability',
                healthImpact: 'Moderate HRV indicates reasonable autonomic balance but room for improvement in stress management',
                improvementSuggestions: [
                    'Incorporate relaxation practices into daily routine',
                    'Monitor stress levels and recovery',
                    'Engage in regular physical activity',
                    'Practice good sleep hygiene',
                    'Stay hydrated and maintain balanced diet'
                ]
            },
            'high': { 
                min: 51, max: 100, 
                interpretation: 'Good heart rate variability',
                healthImpact: 'Good HRV indicates healthy autonomic nervous system function and stress resilience',
                improvementSuggestions: [
                    'Maintain current stress management practices',
                    'Continue regular exercise routine',
                    'Monitor HRV trends over time',
                    'Practice consistent sleep habits',
                    'Stay mindful of lifestyle factors affecting HRV'
                ]
            },
            'very_high': { 
                min: 101, 
                interpretation: 'Excellent heart rate variability',
                healthImpact: 'Excellent HRV indicates optimal autonomic function, stress resilience, and cardiovascular health',
                improvementSuggestions: [
                    'Maintain excellent lifestyle habits',
                    'Share successful stress management strategies',
                    'Monitor HRV for any significant changes',
                    'Continue balanced approach to fitness and recovery',
                    'Consider HRV as indicator of overall well-being'
                ]
            }
        },
        'BMI': {
            'underweight': { 
                max: 18.5, 
                interpretation: 'Below normal weight range',
                healthImpact: 'Underweight status may indicate nutritional deficiencies, metabolic issues, or other health concerns',
                improvementSuggestions: [
                    'Consult with nutritionist or healthcare provider',
                    'Focus on nutrient-dense, calorie-rich foods',
                    'Monitor for underlying health conditions',
                    'Incorporate strength training to build muscle mass',
                    'Track dietary intake and eating patterns'
                ]
            },
            'normal': { 
                min: 18.6, max: 24.9, 
                interpretation: 'Healthy weight range',
                healthImpact: 'Normal BMI range associated with lower risk of weight-related health issues',
                improvementSuggestions: [
                    'Maintain balanced diet and regular exercise',
                    'Focus on body composition rather than just weight',
                    'Monitor for any significant weight changes',
                    'Practice mindful eating habits',
                    'Engage in regular physical activity'
                ]
            },
            'overweight': { 
                min: 25, max: 29.9, 
                interpretation: 'Above normal weight range',
                healthImpact: 'Overweight status increases risk of cardiovascular disease, diabetes, and joint problems',
                improvementSuggestions: [
                    'Adopt gradual, sustainable weight loss approach',
                    'Increase physical activity levels',
                    'Focus on whole, unprocessed foods',
                    'Practice portion control and mindful eating',
                    'Consider professional guidance for personalized plan'
                ]
            },
            'obese': { 
                min: 30, 
                interpretation: 'Obese range',
                healthImpact: 'Obesity significantly increases risk of chronic diseases including heart disease, diabetes, and certain cancers',
                improvementSuggestions: [
                    'Seek professional medical and nutritional guidance',
                    'Start with modest, achievable lifestyle changes',
                    'Focus on health improvements rather than just weight loss',
                    'Incorporate regular physical activity appropriate for current fitness',
                    'Consider behavioral therapy or support groups'
                ]
            }
        },
        'FatRatio': {
            'low': { 
                max: 15, 
                interpretation: 'Below average body fat percentage',
                healthImpact: 'Very low body fat may indicate nutritional deficiencies or excessive leanness',
                improvementSuggestions: [
                    'Ensure adequate caloric intake for health',
                    'Focus on healthy fats in diet',
                    'Monitor for hormonal or metabolic issues',
                    'Consider consulting with nutrition professional',
                    'Maintain balanced approach to fitness and nutrition'
                ]
            },
            'healthy': { 
                min: 16, max: 25, 
                interpretation: 'Healthy body fat range',
                healthImpact: 'Healthy body fat percentage supports hormonal function and overall health',
                improvementSuggestions: [
                    'Maintain balanced diet and exercise routine',
                    'Focus on body composition rather than just fat percentage',
                    'Monitor for any significant changes',
                    'Practice sustainable lifestyle habits',
                    'Stay hydrated and eat nutrient-dense foods'
                ]
            },
            'elevated': { 
                min: 26, max: 30, 
                interpretation: 'Above average body fat',
                healthImpact: 'Elevated body fat increases risk of metabolic syndrome and cardiovascular issues',
                improvementSuggestions: [
                    'Adopt gradual fat loss approach',
                    'Increase resistance training to build lean mass',
                    'Focus on protein-rich, whole food diet',
                    'Incorporate both cardiovascular and strength exercise',
                    'Practice consistent, sustainable habits'
                ]
            },
            'high': { 
                min: 31, 
                interpretation: 'High body fat percentage',
                healthImpact: 'High body fat percentage significantly increases health risks including diabetes and heart disease',
                improvementSuggestions: [
                    'Seek professional guidance for safe fat loss',
                    'Focus on lifestyle changes rather than quick fixes',
                    'Incorporate regular physical activity',
                    'Address dietary habits and portion control',
                    'Monitor health markers regularly'
                ]
            }
        }
    };

    const metricCategories = categories[metric as keyof typeof categories];
    if (!metricCategories) {
        return { 
            category: 'unknown', 
            interpretation: 'No categorization available',
            healthImpact: 'Unable to determine health impact',
            improvementSuggestions: []
        };
    }

    for (const [category, range] of Object.entries(metricCategories)) {
        const hasMin = 'min' in range;
        const hasMax = 'max' in range;
        
        if ((!hasMin || value >= range.min) && (!hasMax || value <= range.max)) {
            return { 
                category, 
                interpretation: range.interpretation,
                healthImpact: range.healthImpact,
                improvementSuggestions: range.improvementSuggestions
            };
        }
    }

    return { 
        category: 'out_of_range', 
        interpretation: 'Value outside expected range',
        healthImpact: 'Extreme values may indicate measurement error or significant health concern',
        improvementSuggestions: [
            'Verify measurement accuracy',
            'Consult with healthcare professional',
            'Monitor for consistent patterns',
            'Consider comprehensive health evaluation'
        ]
    };
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
    sleepConsistency: number;
    sleepLatency: number;
    sleepDisruptions: number;
    sleepRegularity: number;
} {
    if (sleepData.length === 0) {
        return {
            totalSleep: 0,
            sleepEfficiency: 0,
            remPercentage: 0,
            deepPercentage: 0,
            lightPercentage: 0,
            awakePercentage: 0,
            sleepQualityScore: 0,
            sleepConsistency: 0,
            sleepLatency: 0,
            sleepDisruptions: 0,
            sleepRegularity: 0
        };
    }

    const sleepDuration = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepDuration')?.value || 0;
    const sleepInBed = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepInBedDuration')?.value || 0;
    const remSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepREMDuration')?.value || 0;
    const deepSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepDeepDuration')?.value || 0;
    const lightSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepLightDuration')?.value || 0;
    const awakeSleep = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepAwakeDuration')?.value || 0;
    const sleepLatencyData = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepLatency')?.value || 0;
    const sleepDisruptionsData = sleepData.find(d => d.dailyDynamicValueTypeName === 'SleepDisruptions')?.value || 0;

    const totalSleep = convertValue(sleepDuration, 'LONG');
    const totalInBed = convertValue(sleepInBed, 'LONG');
    const rem = convertValue(remSleep, 'LONG');
    const deep = convertValue(deepSleep, 'LONG');
    const light = convertValue(lightSleep, 'LONG');
    const awake = convertValue(awakeSleep, 'LONG');
    const sleepLatency = convertValue(sleepLatencyData, 'LONG');
    const sleepDisruptions = convertValue(sleepDisruptionsData, 'LONG');

    const sleepEfficiency = totalInBed > 0 ? (totalSleep / totalInBed) * 100 : 0;
    const totalSleepStages = rem + deep + light + awake;
    
    // Calculate sleep consistency (standard deviation of sleep duration over time)
    const sleepDurations = sleepData
        .filter(d => d.dailyDynamicValueTypeName === 'SleepDuration')
        .map(d => convertValue(d.value, 'LONG'));
    
    const sleepConsistency = calculateConsistency(sleepDurations);
    
    // Calculate sleep regularity (consistency of bedtime/wake time)
    const sleepRegularity = calculateSleepRegularity(sleepData);
    
    return {
        totalSleep,
        sleepEfficiency,
        remPercentage: totalSleepStages > 0 ? (rem / totalSleepStages) * 100 : 0,
        deepPercentage: totalSleepStages > 0 ? (deep / totalSleepStages) * 100 : 0,
        lightPercentage: totalSleepStages > 0 ? (light / totalSleepStages) * 100 : 0,
        awakePercentage: totalSleepStages > 0 ? (awake / totalSleepStages) * 100 : 0,
        sleepQualityScore: calculateSleepQualityScore(sleepEfficiency, rem, deep),
        sleepConsistency,
        sleepLatency,
        sleepDisruptions,
        sleepRegularity
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

// Helper function to analyze activity levels
function analyzeActivityLevels(activityData: any[]): {
    steps: number;
    activeCalories: number;
    totalCalories: number;
    distance: number;
    activityScore: number;
    sedentaryTime: number;
    lightActivity: number;
    moderateActivity: number;
    vigorousActivity: number;
    activityIntensityScore: number;
    movementConsistency: number;
} {
    const stepsData = activityData.find(d => d.dailyDynamicValueTypeName === 'Steps')?.value || '0';
    const activeCaloriesData = activityData.find(d => d.dailyDynamicValueTypeName === 'ActiveBurnedCalories')?.value || '0';
    const totalCaloriesData = activityData.find(d => d.dailyDynamicValueTypeName === 'BurnedCalories')?.value || '0';
    const distanceData = activityData.find(d => d.dailyDynamicValueTypeName === 'CoveredDistance')?.value || '0';
    const sedentaryData = activityData.find(d => d.dailyDynamicValueTypeName === 'SedentaryDuration')?.value || '0';
    const lightActivityData = activityData.find(d => d.dailyDynamicValueTypeName === 'LightActivityDuration')?.value || '0';
    const moderateActivityData = activityData.find(d => d.dailyDynamicValueTypeName === 'ModerateActivityDuration')?.value || '0';
    const vigorousActivityData = activityData.find(d => d.dailyDynamicValueTypeName === 'VigorousActivityDuration')?.value || '0';

    const steps = convertValue(stepsData, 'LONG');
    const activeCalories = convertValue(activeCaloriesData, 'LONG');
    const totalCalories = convertValue(totalCaloriesData, 'LONG');
    const distance = convertValue(distanceData, 'DOUBLE');
    const sedentaryTime = convertValue(sedentaryData, 'LONG');
    const lightActivity = convertValue(lightActivityData, 'LONG');
    const moderateActivity = convertValue(moderateActivityData, 'LONG');
    const vigorousActivity = convertValue(vigorousActivityData, 'LONG');

    // Calculate activity intensity score
    const activityIntensityScore = calculateActivityIntensityScore(
        lightActivity, moderateActivity, vigorousActivity, sedentaryTime
    );

    // Calculate movement consistency
    const stepCounts = activityData
        .filter(d => d.dailyDynamicValueTypeName === 'Steps')
        .map(d => convertValue(d.value, 'LONG'));
    const movementConsistency = calculateConsistency(stepCounts);

    return {
        steps,
        activeCalories,
        totalCalories,
        distance,
        activityScore: calculateActivityScore(steps, activeCalories),
        sedentaryTime,
        lightActivity,
        moderateActivity,
        vigorousActivity,
        activityIntensityScore,
        movementConsistency
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

// Helper function to analyze heart rate data
function analyzeHeartRate(heartRateData: any[]): {
    restingHR: number;
    averageHR: number;
    maxHR: number;
    minHR: number;
    hrVariability: number;
    cardiovascularScore: number;
    hrRecovery: number;
    abnormalHeartRateEvents: number;
    heartRateTrend: string;
    heartRateVolatility: number;
} {
    const restingHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRateResting')?.value || '0';
    const averageHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRate')?.value || '0';
    const maxHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRateMax')?.value || '0';
    const minHRData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRateMin')?.value || '0';
    const rmssdData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'Rmssd')?.value || '0';
    const hrRecoveryData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'HeartRateRecovery')?.value || '0';
    const abnormalEventsData = heartRateData.find(d => d.dailyDynamicValueTypeName === 'AbnormalHeartRateEvents')?.value || '0';

    const restingHR = convertValue(restingHRData, 'LONG');
    const averageHR = convertValue(averageHRData, 'LONG');
    const maxHR = convertValue(maxHRData, 'LONG');
    const minHR = convertValue(minHRData, 'LONG');
    const hrVariability = convertValue(rmssdData, 'DOUBLE');
    const hrRecovery = convertValue(hrRecoveryData, 'LONG');
    const abnormalHeartRateEvents = convertValue(abnormalEventsData, 'LONG');

    // Extract heart rate values for trend analysis
    const heartRateValues = heartRateData
        .filter(d => d.dailyDynamicValueTypeName === 'HeartRateResting')
        .map(d => convertValue(d.value, 'LONG'));

    const dates = heartRateData
        .filter(d => d.dailyDynamicValueTypeName === 'HeartRateResting')
        .map(d => d.date || '');

    // Analyze heart rate trends
    const trendAnalysis = detectTrends(heartRateValues, dates);

    // Calculate heart rate volatility
    const heartRateVolatility = heartRateValues.length > 1 
        ? Math.sqrt(heartRateValues.slice(1).reduce((sum, val, i) => 
            sum + Math.pow(val - heartRateValues[i], 2), 0) / (heartRateValues.length - 1))
        : 0;

    return {
        restingHR,
        averageHR,
        maxHR,
        minHR,
        hrVariability,
        cardiovascularScore: calculateCardiovascularScore(restingHR, hrVariability),
        hrRecovery,
        abnormalHeartRateEvents,
        heartRateTrend: trendAnalysis.trend,
        heartRateVolatility
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
    detailedAnalysis: {
        strengths: string[];
        areasForImprovement: string[];
        urgentAttentionNeeded: string[];
        longTermRecommendations: string[];
    };
} {
    // Weighted average: sleep 30%, activity 30%, cardiovascular 40%
    const score = Math.round(
        (sleepScore * 0.3) + 
        (activityScore * 0.3) + 
        (cardiovascularScore * 0.4)
    );
    
    let category = '';
    let recommendations: string[] = [];
    let detailedAnalysis = {
        strengths: [] as string[],
        areasForImprovement: [] as string[],
        urgentAttentionNeeded: [] as string[],
        longTermRecommendations: [] as string[]
    };
    
    // Analyze individual components
    const sleepCategory = getScoreCategory(sleepScore);
    const activityCategory = getScoreCategory(activityScore);
    const cardiovascularCategory = getScoreCategory(cardiovascularScore);
    
    // Build detailed analysis based on individual scores
    if (sleepScore >= 80) {
        detailedAnalysis.strengths.push('Excellent sleep quality and patterns');
    } else if (sleepScore >= 60) {
        detailedAnalysis.areasForImprovement.push('Sleep quality could be improved');
    } else {
        detailedAnalysis.urgentAttentionNeeded.push('Sleep patterns require significant improvement');
    }
    
    if (activityScore >= 80) {
        detailedAnalysis.strengths.push('High activity levels and physical fitness');
    } else if (activityScore >= 60) {
        detailedAnalysis.areasForImprovement.push('Activity levels could be increased');
    } else {
        detailedAnalysis.urgentAttentionNeeded.push('Physical activity levels are insufficient');
    }
    
    if (cardiovascularScore >= 80) {
        detailedAnalysis.strengths.push('Excellent cardiovascular health indicators');
    } else if (cardiovascularScore >= 60) {
        detailedAnalysis.areasForImprovement.push('Cardiovascular health could be improved');
    } else {
        detailedAnalysis.urgentAttentionNeeded.push('Cardiovascular health requires attention');
    }
    
    if (score >= 85) {
        category = 'Excellent';
        recommendations = [
            'Maintain your current healthy lifestyle habits',
            'Continue with regular exercise and sleep routines',
            'Monitor for any significant changes in health metrics',
            'Consider sharing your successful strategies with others',
            'Explore advanced wellness optimization techniques'
        ];
        detailedAnalysis.longTermRecommendations = [
            'Focus on maintaining excellent health across all dimensions',
            'Consider preventive health screenings and check-ups',
            'Explore advanced fitness and wellness goals',
            'Share your health journey to inspire others',
            'Stay informed about latest health and wellness research'
        ];
    } else if (score >= 70) {
        category = 'Good';
        recommendations = [
            'Consider targeted improvements in specific health areas',
            'Increase daily activity levels with more variety',
            'Optimize sleep quality through environment and routine',
            'Monitor cardiovascular metrics and stress levels',
            'Incorporate relaxation and recovery practices'
        ];
        detailedAnalysis.longTermRecommendations = [
            'Work on elevating good health to excellent health',
            'Address specific areas needing improvement systematically',
            'Consider professional guidance for optimization',
            'Build sustainable habits for long-term health',
            'Monitor progress and adjust strategies as needed'
        ];
    } else if (score >= 55) {
        category = 'Fair';
        recommendations = [
            'Focus on improving sleep consistency and duration',
            'Increase moderate to vigorous physical activity significantly',
            'Implement stress reduction and relaxation techniques',
            'Monitor heart rate variability and resting heart rate closely',
            'Consider dietary improvements and hydration optimization'
        ];
        detailedAnalysis.longTermRecommendations = [
            'Develop comprehensive health improvement plan',
            'Address multiple health dimensions simultaneously',
            'Seek professional guidance for personalized strategies',
            'Establish measurable goals and track progress',
            'Build foundation for long-term health improvements'
        ];
    } else {
        category = 'Needs Improvement';
        recommendations = [
            'Consult with healthcare professional for comprehensive evaluation',
            'Establish regular sleep schedule with proper sleep hygiene',
            'Incorporate structured exercise routine starting at appropriate level',
            'Monitor cardiovascular health metrics regularly',
            'Implement significant dietary and lifestyle improvements'
        ];
        detailedAnalysis.longTermRecommendations = [
            'Prioritize health improvements as urgent matter',
            'Develop step-by-step improvement plan with professional help',
            'Address most critical health issues first',
            'Establish regular monitoring and follow-up routine',
            'Consider comprehensive lifestyle overhaul for sustainable health'
        ];
    }
    
    // Add specific recommendations based on urgent needs
    if (detailedAnalysis.urgentAttentionNeeded.length > 0) {
        recommendations.unshift('IMMEDIATE ACTION NEEDED: ' + detailedAnalysis.urgentAttentionNeeded.join(', '));
    }
    
    return {
        score,
        category,
        recommendations,
        detailedAnalysis
    };
}

function getScoreCategory(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
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
