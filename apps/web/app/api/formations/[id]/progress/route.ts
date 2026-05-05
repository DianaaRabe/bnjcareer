import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/formations/[id]/progress — mark a module as complete, save exercise scores
export async function POST(
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
    const { module_id, exercise_score, open_answer } = body as {
      module_id: string;
      exercise_score?: number;
      open_answer?: string;
    };

    if (!module_id) {
      return NextResponse.json({ error: "module_id requis" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Find enrollment
    const { data: enrollment } = await admin
      .from("formation_enrollments")
      .select("id, progress_pct")
      .eq("formation_id", params.id)
      .eq("student_id", user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Vous n'êtes pas inscrit à cette formation" },
        { status: 403 }
      );
    }

    // Upsert module progress
    const { error: progressError } = await admin
      .from("formation_progress")
      .upsert(
        {
          enrollment_id: enrollment.id,
          module_id,
          completed: true,
          exercise_score: exercise_score ?? null,
          open_answer: open_answer ?? null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "enrollment_id,module_id" }
      );

    if (progressError) throw progressError;

    // Recalculate progress_pct
    const { count: totalModules } = await admin
      .from("formation_modules")
      .select("*", { count: "exact", head: true })
      .eq("formation_id", params.id);

    const { count: completedModules } = await admin
      .from("formation_progress")
      .select("*", { count: "exact", head: true })
      .eq("enrollment_id", enrollment.id)
      .eq("completed", true);

    const newPct =
      totalModules && totalModules > 0
        ? Math.round(((completedModules || 0) / totalModules) * 100)
        : 0;

    const isCompleted = newPct === 100;

    // Update enrollment progress + grant badge if complete
    await admin
      .from("formation_enrollments")
      .update({
        progress_pct: newPct,
        ...(isCompleted
          ? {
              completed_at: new Date().toISOString(),
              has_badge: true,
            }
          : {}),
      })
      .eq("id", enrollment.id);

    return NextResponse.json({
      progress_pct: newPct,
      is_completed: isCompleted,
      has_badge: isCompleted,
    });
  } catch (err: any) {
    console.error("[progress POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/formations/[id]/progress — get all module progress for current user
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ progress: [] });

    const { data: enrollment } = await supabase
      .from("formation_enrollments")
      .select("id, progress_pct, has_badge, certificate_url")
      .eq("formation_id", params.id)
      .eq("student_id", user.id)
      .single();

    if (!enrollment) return NextResponse.json({ progress: [], enrollment: null });

    const { data: progress } = await supabase
      .from("formation_progress")
      .select("module_id, completed, exercise_score, open_answer, completed_at")
      .eq("enrollment_id", enrollment.id);

    return NextResponse.json({ progress: progress || [], enrollment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
