import { CallTemplateFunctionArgs, Context, PluginDefinition } from '@yaakapp/api';
import fs from 'node:fs';

export const plugin: PluginDefinition = {
  templateFunctions: [{
    name: 'fs.readFile',
    args: [{ title: 'Select File', type: 'file', name: 'path', label: 'File' }],
    async onRender(_ctx: Context, args: CallTemplateFunctionArgs): Promise<string | null> {
      if (!args.values.path) return null;

      try {
        return fs.promises.readFile(args.values.path, 'utf-8');
      } catch (err) {
        return null;
      }
    },
  }],
};
