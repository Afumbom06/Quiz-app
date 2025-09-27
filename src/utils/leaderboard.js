import { supabase } from "./supabaseClient";

// Save or update user's best score
export async function addOrUpdateScore(score) {
  try {
    // Get current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("Please log in first!");
      return null;
    }

    // Check if user already has a score
    const { data: existing, error: fetchError } = await supabase
      .from("leaderboard")
      .select("id, score")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Update only if new score is higher
      if (score > existing.score) {
        const { data, error } = await supabase
          .from("leaderboard")
          .update({ score, name: user.email, date: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
        alert("🎉 New high score saved!");
        return data;
      } else {
        alert("⚠️ Your previous score is higher. Not updated.");
        return existing;
      }
    } else {
      // Insert new score
      const { data, error } = await supabase
        .from("leaderboard")
        .insert([{ user_id: user.id, name: user.email, score, date: new Date().toISOString() }]);

      if (error) throw error;
      alert("✅ Score saved!");
      return data;
    }
  } catch (err) {
    console.error("Error saving score:", err);
    alert("Unexpected error: " + err.message);
    return null;
  }
}

// Fetch top scores with user-friendly names
export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("id, score, name, date")
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    alert("Unexpected error: " + err.message);
    return [];
  }
}
