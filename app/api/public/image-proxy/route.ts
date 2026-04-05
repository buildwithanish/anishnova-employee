import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ success: false, message: "Valid image URL is required." }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Unable to fetch image." }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Image proxy request failed." }, { status: 500 });
  }
}
