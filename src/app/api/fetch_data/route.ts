export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Get parameters from query string
    const userId = searchParams.get("userId");
    const dataType = searchParams.get("dataType") || "daily"; // default to daily data
    const startDate = searchParams.get("startDate") || "2025-05-01";
    const endDate = searchParams.get("endDate") || "2026-04-11";
    const valueTypes = searchParams.get("valueTypes") || "";
    const dataSources = searchParams.get("dataSources") || "";

    // Validate required parameters
    if (!userId) {
        return Response.json(
            { error: "userId parameter is required" },
            { status: 400 },
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
        return Response.json({ error: "Invalid userId" }, { status: 403 });
    }

    // Build URLSearchParams for form-urlencoded body
    const bodyParams = new URLSearchParams();
    bodyParams.append("authenticationToken", userId);

    let endpoint = "";

    if (dataType === "epoch") {
        // Epoch data endpoint
        endpoint = "https://api-qa.thryve.de/v5/dynamicEpochValues";
        bodyParams.append("startTimestamp", `${startDate}T00:00:00Z`);
        bodyParams.append("endTimestamp", `${endDate}T23:59:59Z`);
    } else {
        // Daily data endpoint (default)
        endpoint = "https://api-qa.thryve.de/v5/dailyDynamicValues";
        bodyParams.append("startDay", startDate);
        bodyParams.append("endDay", endDate);
    }

    // Add optional parameters if provided
    if (valueTypes) {
        bodyParams.append("valueTypes", valueTypes);
    }

    if (dataSources) {
        bodyParams.append("dataSources", dataSources);
    }

    // Add recommended parameters
    bodyParams.append("detailed", "true");
    bodyParams.append("displayTypeName", "true");
    bodyParams.append("displayPartnerUserID", "true");

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${process.env.THRYVE_AUTH}`,
                AppAuthorization: `Basic ${process.env.THRYVE_APP_AUTH}`,
            },
            body: bodyParams.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json(
                {
                    error: `Thryve API error: ${response.status} - ${errorText}`,
                },
                { status: response.status },
            );
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        return Response.json(
            {
                error: `Failed to fetch data from Thryve: ${error instanceof Error ? error.message : String(error)}`,
            },
            { status: 500 },
        );
    }
}
