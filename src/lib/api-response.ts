import { NextResponse } from "next/server";

export function success<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>
) {
  return NextResponse.json({ success: true, data }, { status, headers });
}

export function error(
  message: string,
  status = 400,
  headers?: Record<string, string>
) {
  return NextResponse.json({ success: false, error: message }, { status, headers });
}
