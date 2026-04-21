import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, location, country } = body;

        const token = process.env.APIFY_API_TOKEN || '';
        if (!token) {
            return NextResponse.json({ error: "APIFY_API_TOKEN est manquant dans .env" }, { status: 500 });
        }

        const input = {
            "country": country || "fr",
            "query": query || "Analyst",
            "location": location || "Paris",
            "maxRows": 15,
            "remote": "remote",
            "sort": "date",
            "jobType": "fulltime",
            "fromDays": "14",
            "enableUniqueJobs": true,
            "includeSimilarJobs": false
        };

        console.log("=== APIFY SCRAPPER CALL ===");
        console.log("Reçu depuis le Frontend:", { query, location, country });
        console.log("Payload envoyé à Apify:", input);
        console.log("===========================");

        // Utilisation directe de l'API REST d'Apify (synchrone)
        // Cela permet d'éviter l'erreur NextJS avec "proxy-agent" contenu dans "apify-client"
        const response = await fetch(`https://api.apify.com/v2/acts/MXLpngmVpE8WTESQr/run-sync-get-dataset-items?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            // On laisse le temps au scraper de répondre (Next.js route timeout par défaut)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Apify API Error: ${errText}`);
        }

        const items = await response.json();

        return NextResponse.json({ items });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
