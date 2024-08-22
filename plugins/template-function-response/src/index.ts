import { DOMParser } from '@xmldom/xmldom';
import { CallTemplateFunctionArgs, Context, HttpResponse, Plugin } from '@yaakapp/api';
import { JSONPath } from 'jsonpath-plus';
import { readFileSync } from 'node:fs';
import xpath from 'xpath';

export const plugin: Plugin = {
  templateFunctions: [{
    name: 'Response',
    args: [
      {
        type: 'http_request',
        name: 'request',
        label: 'Request',
      },
      {
        type: 'text',
        name: 'path',
        label: 'JSONPath or XPath',
        placeholder: '$.books[0].id or /books[0]/id',
      },
      {
        type: 'select',
        name: 'behavior',
        label: 'Sending Behavior',
        defaultValue: 'smart',
        options: [
          { name: 'When no responses', value: 'smart' },
          { name: 'Always', value: 'always' },
          { name: 'Never', value: 'never' },
        ],
      },
    ],
    async onRender(ctx: Context, args: CallTemplateFunctionArgs): Promise<string | null> {
      if (!args.values.request || !args.values.path) {
        return null;
      }

      const httpRequest = await ctx.httpRequest.getById({ id: args.values.request ?? 'n/a' });
      if (httpRequest == null) {
        return null;
      }
      const renderedHttpRequest = await ctx.httpRequest.render({ httpRequest });

      const responses = await ctx.httpResponse.find({ requestId: httpRequest.id, limit: 1 });

      if (args.values.behavior === 'never' && responses.length === 0) {
        return null;
      }

      let response: HttpResponse | null = responses[0] ?? null;

      // Previews happen a ton, and we don't want to send too many times on "always," so treat
      // it as "smart" during preview.
      let behavior = args.values.behavior === 'always' && args.purpose === 'preview' ? 'smart' : args.values.behavior;

      // Send if no responses and "smart," or "always"
      if ((behavior === 'smart' && response == null) || behavior === 'always') {
        response = await ctx.httpRequest.send({ httpRequest: renderedHttpRequest });
      }

      if (response == null) {
        return null;
      }

      if (response.bodyPath == null) {
        return null;
      }

      let body;
      try {
        body = readFileSync(response.bodyPath, 'utf-8');
      } catch (_) {
        return null;
      }

      try {
        return filterJSONPath(body, args.values.path);
      } catch (err) {
        // Probably not JSON, try XPath
      }

      try {
        return filterXPath(body, args.values.path);
      } catch (err) {
        // Probably not XML
      }

      return null; // Bail out
    },
  }],
};

function filterJSONPath(body: string, path: string): string {
  const parsed = JSON.parse(body);
  const items = JSONPath({ path, json: parsed })[0];
  if (items == null) {
    return '';
  }

  if (
    Object.prototype.toString.call(items) === '[object Array]' ||
    Object.prototype.toString.call(items) === '[object Object]'
  ) {
    return JSON.stringify(items);
  } else {
    return String(items);
  }
}

function filterXPath(body: string, path: string): string {
  const doc = new DOMParser().parseFromString(body, 'text/xml');
  const items = xpath.select(path, doc, false);

  if (Array.isArray(items)) {
    return items[0] != null ? String(items[0].firstChild ?? '') : '';
  } else {
    // Not sure what cases this happens in (?)
    return String(items);
  }
}
