import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userProfile: any = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      userProfile = data;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.get("origin") || "http://localhost:3000",
          "X-Title": "BNJ Skills Maker",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `
            Tu es l'assistant intelligent de BNJ Skills Maker.

            🎯 Ton rôle :
            Aider le candidat à améliorer son employabilité, trouver un emploi et progresser dans sa carrière.

            🧑‍💼 Contexte utilisateur :
            - Nom : ${userProfile?.first_name || "Non renseigné"} ${userProfile?.last_name || ""}
            - Objectif : ${userProfile?.goals || "Non défini"}
            - Niveau d'étude : ${userProfile?.education_level || "Non renseigné"}
            - Secteur : ${userProfile?.industry || "Non renseigné"}
            - Forces : ${JSON.stringify(userProfile?.strengths || [])}
            - Faiblesses : ${JSON.stringify(userProfile?.weaknesses || [])}
            - Compétences : ${JSON.stringify(userProfile?.skills || [])}

            📌 Instructions importantes :
            - Réponds toujours en français
            - Sois concret, utile et actionnable
            - Donne des conseils personnalisés basés sur le profil
            - Si une info manque, adapte ta réponse intelligemment
            - Aide à progresser (pas juste répondre)

            💡 Ton ton :
            - professionnel
            - motivant
            - direct (pas de blabla inutile)
            `,
            },
            ...(messages || []),
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    // Pass the stream directly to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
