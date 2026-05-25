import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { verifySession } from "@/lib/session";

function getRepo(): { owner: string; repo: string } {
  const full = process.env.GITHUB_REPO || "aaonhub/chogath-feastament";
  const [owner, repo] = full.split("/");
  return { owner, repo };
}

export async function GET(request: NextRequest) {
  const role = verifySession(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { owner, repo } = getRepo();

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "data/matchups.json",
    });

    if ("content" in data && typeof data.content === "string") {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return NextResponse.json({
        data: JSON.parse(content),
        sha: data.sha,
      });
    }

    return NextResponse.json(
      { error: "Unexpected response from GitHub" },
      { status: 500 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch matchups:", msg);
    return NextResponse.json(
      { error: `Failed to fetch matchups from GitHub: ${msg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const role = verifySession(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, sha, message } = body as {
      data: { mid: unknown[]; top: unknown[]; changelog?: unknown[]; tankItems?: unknown[]; apItems?: unknown[] };
      sha: string;
      message?: string;
    };

    if (
      !data ||
      !Array.isArray(data.mid) ||
      !Array.isArray(data.top) ||
      !sha
    ) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { owner, repo } = getRepo();

    const content = Buffer.from(
      JSON.stringify(data, null, 2),
      "utf-8"
    ).toString("base64");

    const commitMessage =
      message || `Update matchups via admin: ${new Date().toISOString()}`;

    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "data/matchups.json",
      message: commitMessage,
      content,
      sha,
    });

    const newSha = response.data.content?.sha;
    return NextResponse.json({ ok: true, sha: newSha });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 409
    ) {
      return NextResponse.json(
        {
          error:
            "Conflict: matchups were modified by someone else. Please reload and try again.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save matchups" },
      { status: 500 }
    );
  }
}
