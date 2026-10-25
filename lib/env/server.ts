import 'server-only';

import { parseServerEnvironment } from '@/lib/env/schema';

export function getServerEnvironment() {
  return parseServerEnvironment(process.env);
}
