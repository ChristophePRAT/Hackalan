# Sample API Requests for Data Analysis

## Fetch API Example

```javascript
// Sample fetch request to the analyse_data endpoint
fetch('http://localhost:3000/api/analyse_data?userId=a463e0bf26d790d6afdfda0cfd161cf5&startDate=2025-01-01&endDate=2025-01-31&analysisType=comprehensive')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Analysis Results:', data);
    // Process the rich data for LLM improvement plan generation
  })
  .catch(error => {
    console.error('Error fetching analysis:', error);
  });
```

## cURL Example

```bash
# Sample cURL request to the analyse_data endpoint
curl -X GET "http://localhost:3000/api/analyse_data?userId=a463e0bf26d790d6afdfda0cfd161cf5&startDate=2025-01-01&endDate=2025-01-31&analysisType=comprehensive" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

## Request Parameters

- `userId` (required): Valid user ID from the allowed list
- `startDate`: Start date for analysis period (default: '2025-01-01')
- `endDate`: End date for analysis period (default: '2025-01-31')
- `analysisType`: Type of analysis to perform (default: 'comprehensive')
  - Options: 'comprehensive', 'sleep', 'activity', 'cardiovascular'

## Example Response Structure

The enhanced API now returns comprehensive data including:

```json
{
  "success": true,
  "userId": "a463e0bf26d790d6afdfda0cfd161cf5",
  "analysisType": "comprehensive",
  "sleepAnalysis": {
    "totalSleep": 420,
    "sleepEfficiency": 88.5,
    "remPercentage": 22.1,
    "deepPercentage": 18.7,
    "lightPercentage": 52.4,
    "awakePercentage": 6.8,
    "sleepQualityScore": 85,
    "sleepConsistency": 92,
    "sleepLatency": 12,
    "sleepDisruptions": 2,
    "sleepRegularity": 88
  },
  "activityAnalysis": {
    "steps": 8500,
    "activeCalories": 420,
    "totalCalories": 2100,
    "distance": 6.2,
    "activityScore": 78,
    "sedentaryTime": 320,
    "lightActivity": 180,
    "moderateActivity": 90,
    "vigorousActivity": 30,
    "activityIntensityScore": 68,
    "movementConsistency": 85
  },
  "cardiovascularAnalysis": {
    "restingHR": 62,
    "averageHR": 74,
    "maxHR": 145,
    "minHR": 54,
    "hrVariability": 48,
    "cardiovascularScore": 82,
    "hrRecovery": 22,
    "abnormalHeartRateEvents": 0,
    "heartRateTrend": "stable",
    "heartRateVolatility": 3.2
  },
  "bodyComposition": {
    "weight": 72.5,
    "bmi": 23.8,
    "fatRatio": 18,
    "muscleMass": 58.2,
    "bodyTemp": 36.7
  },
  "overallHealthScore": {
    "score": 84,
    "category": "Excellent",
    "recommendations": [
      "Maintain your current healthy lifestyle habits",
      "Continue with regular exercise and sleep routines",
      "Monitor for any significant changes in health metrics",
      "Consider sharing your successful strategies with others",
      "Explore advanced wellness optimization techniques"
    ],
    "detailedAnalysis": {
      "strengths": [
        "Excellent sleep quality and patterns",
        "High activity levels and physical fitness",
        "Excellent cardiovascular health indicators"
      ],
      "areasForImprovement": [],
      "urgentAttentionNeeded": [],
      "longTermRecommendations": [
        "Focus on maintaining excellent health across all dimensions",
        "Consider preventive health screenings and check-ups",
        "Explore advanced fitness and wellness goals",
        "Share your health journey to inspire others",
        "Stay informed about latest health and wellness research"
      ]
    }
  },
  "period": "2025-01-01 to 2025-01-31",
  "dataPoints": 124
}
```

This rich data structure provides comprehensive health metrics that an LLM can use to generate detailed, personalized improvement plans.