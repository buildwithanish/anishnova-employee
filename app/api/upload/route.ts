import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { uploadImageBuffer } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "Image file is required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadedUrl = await uploadImageBuffer(buffer);

  if (uploadedUrl) {
    return NextResponse.json({ success: true, url: uploadedUrl });
  }

  if (buffer.byteLength > 2 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, message: "Configure Cloudinary for images larger than 2MB." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    url: `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`,
  });
}
