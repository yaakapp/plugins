import { Context } from '@yaakapp/api';
import { JSONPath } from 'jsonpath-plus';

export function pluginHookResponseFilter(_ctx: Context, args: { filter: string; body: string }) {
  const parsed = JSON.parse(args.body);
  const filtered = JSONPath({ path: args.filter, json: parsed });
  return JSON.stringify(filtered, null, 2);
}
