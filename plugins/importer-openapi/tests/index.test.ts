import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, test } from 'vitest';
import { pluginHookImport } from '../src';

describe('importer-openapi', () => {
  const p = path.join(__dirname, 'fixtures');
  const fixtures = fs.readdirSync(p);

  for (const fixture of fixtures) {
    test('Imports ' + fixture, async () => {
      const contents = fs.readFileSync(path.join(p, fixture), 'utf-8');
      const imported = await pluginHookImport({}, contents);
      expect(imported?.resources.workspaces).toEqual([
        expect.objectContaining({
          name: 'Swagger Petstore - OpenAPI 3.0',
        }),
      ]);
      expect(imported?.resources.httpRequests.length).toBe(19);
      expect(imported?.resources.folders.length).toBe(7);
    });
  }
});
