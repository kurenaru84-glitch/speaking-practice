import { NextResponse } from "next/server";
import { EMPTY_IMAGE_CATALOG } from "@/lib/image-catalog-types";
import { loadImageCatalog } from "@/lib/image-catalog";

export async function GET() {
  try {
    const catalog = await loadImageCatalog();
    return NextResponse.json(catalog);
  } catch {
    return NextResponse.json(EMPTY_IMAGE_CATALOG);
  }
}
