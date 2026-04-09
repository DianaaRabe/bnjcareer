import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, location } = body;

        const token = process.env.APIFY_API_TOKEN || '';
        if (!token) {
            return NextResponse.json({ error: "APIFY_API_TOKEN est manquant dans .env" }, { status: 500 });
        }

        const input = {
            "country": "us",
            "query": query || "Analyst",
            "location": location || "New York",
            "maxRows": 10,
            "remote": "remote",
            "level": "entry_level",
            "sort": "relevance",
            "jobType": "fulltime",
            "fromDays": "14",
            "urls": [
                "https://indeed.com/cmp/google",
                "https://www.indeed.com/jobs?q=engineer&l=San+Francisco&sc=0kf%3Afcckey%28b1f359487c26ba41%29%3B"
            ],
            "maxRowsPerUrl": 10,
            "enableUniqueJobs": false,
            "includeSimilarJobs": true
        };

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
