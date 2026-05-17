import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";

const rootDir = process.cwd();

const allowedRootFiles = new Set([
  "index.html",
  "zuowen.html",
  "wenyan.html",
  "shici.html",
  "yuedu.html",
  "mingzhu.html",
  "beike.html",
  "about.html",
  "search.html",
  "favorites.html",
  "study-guide.html",
  "updates.html"
]);

const allowedDirectories = new Set([
  "articles",
  "assets",
  "css",
  "data",
  "js",
  "pages"
]);

const blockedSegments = new Set([".", "..", ".git", "node_modules"]);

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf"
};

function normalizeSegments(segments: string[] = []) {
  return segments.filter(Boolean);
}

function isAllowedPath(segments: string[]) {
  if (!segments.length) {
    return true;
  }

  if (segments.some((segment) => blockedSegments.has(segment) || segment.startsWith(".") || segment.includes("/") || segment.includes("\\"))) {
    return false;
  }

  const [firstSegment] = segments;
  if (segments.length === 1) {
    return allowedRootFiles.has(firstSegment);
  }

  return allowedDirectories.has(firstSegment);
}

async function readStaticFile(segments: string[]) {
  const relativePath = segments.length ? segments.join(path.sep) : "index.html";
  const filePath = path.resolve(rootDir, relativePath);
  const relativeToRoot = path.relative(rootDir, filePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  const extension = path.extname(filePath).toLowerCase();
  if (!contentTypes[extension]) {
    return null;
  }

  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    return null;
  }

  return {
    body: await readFile(filePath),
    contentType: contentTypes[extension]
  };
}

export async function GET(_request: NextRequest, { params }: { params: { path?: string[] } }) {
  const segments = normalizeSegments(params.path);

  if (segments[0] === "admin" || !isAllowedPath(segments)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await readStaticFile(segments);
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(file.body, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
