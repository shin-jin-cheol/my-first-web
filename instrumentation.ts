import { assertRequiredServerEnv } from "@/lib/env";

export function register() {
  assertRequiredServerEnv();
}
