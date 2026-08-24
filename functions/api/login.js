export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and password are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Credentials are stored securely in Cloudflare Secrets.
    const validEmail = String(env.CLIENT_EMAIL || "").trim().toLowerCase();
    const validPassword = String(env.CLIENT_PASSWORD || "");

    if (email !== validEmail || password !== validPassword) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email or password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
