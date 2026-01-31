import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const inviteCode = request.nextUrl.searchParams.get("code");

  if (!inviteCode) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  // Extract code from full URL if needed
  const code = inviteCode
    .replace("https://discord.gg/", "")
    .replace("https://discord.com/invite/", "")
    .replace("discord.gg/", "")
    .trim();

  if (!code) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`,
      {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to fetch invite" }, { status: response.status });
    }

    const data = await response.json();

    // Check if icon is animated (starts with a_)
    const iconIsAnimated = data.guild?.icon?.startsWith("a_");
    const iconExtension = iconIsAnimated ? "gif" : "png";

    // Check if banner exists and if it's animated
    const bannerIsAnimated = data.guild?.banner?.startsWith("a_");
    const bannerExtension = bannerIsAnimated ? "gif" : "png";

    return NextResponse.json({
      code: data.code,
      guild: {
        id: data.guild?.id,
        name: data.guild?.name,
        icon: data.guild?.icon,
        iconUrl: data.guild?.icon
          ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${iconExtension}?size=128`
          : null,
        banner: data.guild?.banner,
        bannerUrl: data.guild?.banner
          ? `https://cdn.discordapp.com/banners/${data.guild.id}/${data.guild.banner}.${bannerExtension}?size=480`
          : null,
        splash: data.guild?.splash,
        splashUrl: data.guild?.splash
          ? `https://cdn.discordapp.com/splashes/${data.guild.id}/${data.guild.splash}.png?size=480`
          : null,
      },
      memberCount: data.approximate_member_count,
      onlineCount: data.approximate_presence_count,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error("Discord API error:", error);
    return NextResponse.json({ error: "Failed to fetch invite info" }, { status: 500 });
  }
}
