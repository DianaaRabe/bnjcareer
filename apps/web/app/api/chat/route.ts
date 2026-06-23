import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLMStream, LLMError } from "@/lib/llm/client";

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

    const response = await callLLMStream({
      referer: req.headers.get("origin") || undefined,
      temperature: 0.7,
      maxTokens: 2000,
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
    });

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
    const status = error instanceof LLMError ? 502 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
