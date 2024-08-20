import { DOMParser } from '@xmldom/xmldom';
import { Context } from '@yaakapp/api';
import xpath from 'xpath';

export function pluginHookResponseFilter(
  _ctx: Context,
  { filter, body }: { filter: string; body: string },
) {
  const doc = new DOMParser().parseFromString(body, 'text/xml');
  const result = xpath.select(filter, doc, false);
  if (Array.isArray(result)) {
    return result.map(r => String(r)).join('\n');
  } else {
    // Not sure what cases this happens in (?)
    return String(result);
  }
}
