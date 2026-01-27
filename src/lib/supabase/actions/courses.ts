import { createAdminClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type Course = Tables<"courses">;

// LP表示用に加工したコース型
export interface PublicCourse extends Course {
  // flight_schedule から itinerary を生成
  itinerary: { time: string; activity: string }[];
  // duration_minutes から duration 文字列を生成
  duration: string;
  // images[0] を image として取得
  image: string;
  // max_pax を capacity として使用
  capacity: number;
}

/**
 * 公開コースを単一取得（is_active=true のみ）
 */
export async function getPublicCourseById(
  courseId: string
): Promise<PublicCourse | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Failed to fetch course:", error);
    return null;
  }

  return transformToPublicCourse(data);
}

/**
 * 公開コース一覧を取得（is_active=true のみ）
 */
export async function getPublicCourses(): Promise<PublicCourse[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch courses:", error);
    return [];
  }

  return data.map(transformToPublicCourse);
}

/**
 * 人気コースを取得（popular=true かつ is_active=true）
 */
export async function getPopularCourses(
  limit: number = 4
): Promise<PublicCourse[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .eq("popular", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error("Failed to fetch popular courses:", error);
    return [];
  }

  return data.map(transformToPublicCourse);
}

/**
 * DBのコースをLP表示用に変換
 */
function transformToPublicCourse(course: Course): PublicCourse {
  // flight_schedule から itinerary を生成
  const itinerary: { time: string; activity: string }[] = [];
  if (course.flight_schedule && Array.isArray(course.flight_schedule)) {
    for (const item of course.flight_schedule) {
      if (
        typeof item === "object" &&
        item !== null &&
        "time" in item &&
        "activity" in item
      ) {
        itinerary.push({
          time: String(item.time),
          activity: String(item.activity),
        });
      }
    }
  }

  // duration_minutes から duration 文字列を生成
  const duration = `${course.duration_minutes}分`;

  // images[0] を image として取得
  const image =
    course.images && course.images.length > 0
      ? course.images[0]
      : "/images/placeholder-course.jpg";

  return {
    ...course,
    itinerary,
    duration,
    image,
    capacity: course.max_pax ?? 3,
  };
}
