import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

const bucketName = "teaching-files";
const signedUrlExpiresIn = 300;

type DownloadRouteContext = {
  params: {
    id: string;
  };
};

type TeachingFile = {
  file_path: string | null;
};

export async function GET(request: NextRequest, { params }: DownloadRouteContext) {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: file, error: fileError } = await supabase
    .from("teaching_files")
    .select("file_path")
    .eq("id", params.id)
    .eq("author_id", user.id)
    .single<TeachingFile>();

  if (fileError || !file?.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(file.file_path, signedUrlExpiresIn);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}
