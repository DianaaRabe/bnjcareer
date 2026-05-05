import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/formations — list published formations (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    let query = supabase
      .from("formations")
      .select(
        "id, title, description, thumbnail_url, duration_label, price, level, category, modules_count, coach_id, profiles:coach_id(first_name, last_name, avatar_url)"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (level) query = query.eq("level", level);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ formations: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/formations — coach creates a new formation
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      duration_label,
      price = 0,
      level = "débutant",
      category,
      max_students,
      modules = [],
      milestones = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: "title est requis" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Insert formation
    const { data: formation, error: insertError } = await admin
      .from("formations")
      .insert({
        coach_id: user.id,
        title,
        description,
        duration_label,
        price,
        level,
        category,
        max_students,
        modules_count: modules.length,
        is_published: false,
      })
      .select()
      .single();

    if (insertError || !formation) throw insertError;

    // Insert modules
    if (modules.length > 0) {
      const moduleRows = modules.map((m: any, i: number) => ({
        formation_id: formation.id,
        title: m.title,
        description: m.description || null,
        video_url: m.video_url || null,
        transcript: m.transcript || null,
        exercise_data: m.exercise_data || [],
        duration_minutes: m.duration_minutes || null,
        order_index: i,
      }));
      await admin.from("formation_modules").insert(moduleRows);
    }

    // Insert milestones
    if (milestones.length > 0) {
      const milestoneRows = milestones.map((ms: any, i: number) => ({
        formation_id: formation.id,
        title: ms.title,
        description: ms.description || null,
        order_index: i,
      }));
      await admin.from("formation_milestones").insert(milestoneRows);
    }

    return NextResponse.json({ formation }, { status: 201 });
  } catch (err: any) {
    console.error("[formations POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
