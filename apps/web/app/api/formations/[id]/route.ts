import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/formations/[id] — fetch a single formation with its modules & milestones
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    const { data: formation, error } = await supabase
      .from("formations")
      .select(
        `id, title, description, thumbnail_url, duration_label, price, level,
         category, modules_count, is_published, max_students, created_at,
         coach_id,
         profiles:coach_id(first_name, last_name, avatar_url),
         formation_modules(id, title, description, video_url, transcript, exercise_data, duration_minutes, order_index),
         formation_milestones(id, title, description, order_index)`
      )
      .eq("id", id)
      .single();

    if (error || !formation) {
      return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
    }

    // Sort modules and milestones by order_index
    const sorted = {
      ...formation,
      formation_modules: [...(formation.formation_modules || [])].sort(
        (a, b) => a.order_index - b.order_index
      ),
      formation_milestones: [...(formation.formation_milestones || [])].sort(
        (a, b) => a.order_index - b.order_index
      ),
    };

    return NextResponse.json({ formation: sorted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/formations/[id] — coach updates formation (publish, edit)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Ensure coach owns this formation
    const { data: existing } = await supabase
      .from("formations")
      .select("coach_id")
      .eq("id", id)
      .single();

    if (!existing || existing.coach_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("formations")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ formation: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/formations/[id] — coach deletes their formation
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id)
      .eq("coach_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
