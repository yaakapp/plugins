import { CallTemplateFunctionArgs, Context, PluginDefinition } from '@yaakapp/api';
import fs from 'node:fs';

export const plugin: PluginDefinition = {
  templateFunctions: [{
    name: 'fs.readFile',
    args: [{ type: 'file', name: 'path', label: 'File' }],
    async onRender(ctx: Context, args: CallTemplateFunctionArgs): Promise<string | null> {
      if (!args.values.path) return null;
      return fs.promises.readFile(args.values.path, 'utf-8');
    },
  }],
};
