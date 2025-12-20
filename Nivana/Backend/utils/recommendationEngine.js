// Backend/utils/recommendationEngine.js

const getRecommendations = (currentAssessment, history, answers = []) => {
    let actions = [];
    let guidance = "";

    // 1. Data Extraction
    const severity = currentAssessment.severity || "Low";
    
    // Check trends
    let isWorsening = false;
    if (history && history.length > 0) {
        const lastMood = history[0].moodScore || 50; // default 50 if missing
        const currentMood = currentAssessment.moodScore || 50;
        // Agar mood score 10% se zyada gira hai (Example logic)
        if (currentMood < lastMood - 10) isWorsening = true;
    }

    // 2. Logic Rules

    // 🚨 PRIORITY 1: HIGH RISK
    if (currentAssessment.suicidal || severity === "Severe" || severity === "High") {
        guidance = "Based on your recent assessment, immediate support is highly recommended.";
        actions.push({
            label: "SOS / Helpline",
            type: "emergency",
            actionUrl: "tel:112",
            isRecommended: true,
            recommendationTag: "Urgent"
        });
        actions.push({
            label: "Consult a Therapist",
            type: "booking",
            actionUrl: "/doctors",
            isRecommended: true,
            recommendationTag: "Highly Recommended"
        });
    }
    
    // 📉 PRIORITY 2: WORSENING TREND
    else if (isWorsening) {
        guidance = "Your mood seems a bit lower than last time. Let's boost it.";
        actions.push({
            label: "Mood Booster Music",
            type: "content",
            actionUrl: "/music/uplift",
            isRecommended: true,
            recommendationTag: "Mood Lift"
        });
        actions.push({
            label: "5-Min Gratitude",
            type: "routine",
            actionUrl: "/journal",
            isRecommended: true,
            recommendationTag: "Helpful Now"
        });
    }

    // ✅ PRIORITY 3: STANDARD / STABLE
    else {
        guidance = "You are doing well. Maintain your healthy routine.";
        actions.push({
            label: "Daily Journaling",
            type: "routine",
            actionUrl: "/journal",
            isRecommended: true,
            recommendationTag: "Good Habit"
        });
    }

    return { actions, guidance };
};

module.exports = { getRecommendations };