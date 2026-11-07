
/*
 * トワノソラ アクセスカウンターAPI
 * Cloudflare Pages Functions + D1
 */

const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

// 現在のカウントを取得
export async function onRequestGet(context) {
  try {
    const result = await context.env.COUNTER_DB
      .prepare(
        "SELECT count FROM visitor_counter WHERE id = 1"
      )
      .first();

    if (!result) {
      return jsonResponse({ error: "Counter not found" }, 500);
    }

    return jsonResponse({ count: result.count });
  } catch (error) {
    console.error("Counter read error", error);
    return jsonResponse({ error: "Database error" }, 500);
  }
}

// カウントを1増やす
export async function onRequestPost(context) {
  try {
    const result = await context.env.COUNTER_DB
      .prepare(`
        UPDATE visitor_counter
        SET count = count + 1
        WHERE id = 1
        RETURNING count
      `)
      .first();

    if (!result) {
      return jsonResponse({ error: "Counter not found" }, 500);
    }

    return jsonResponse({ count: result.count });
  } catch (error) {
    console.error("Counter update error", error);
    return jsonResponse({ error: "Database error" }, 500);
  }
}
