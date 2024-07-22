import { convert } from 'openapi-to-postmanv2';
import { pluginHookImport as pluginHookImportPostman } from '../../importer-postman/build';
import { Folder, HttpRequest, Workspace, Environment } from '../../../types/models';

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

interface ExportResources {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
}

export async function pluginHookImport(
  ctx: any,
  contents: string,
): Promise<{ resources: ExportResources } | undefined> {
  const result = await new Promise((resolve, reject) => {
    convert({ type: 'string', data: contents }, {}, (err, result) => {
      if (err != null) reject(err);

      if (Array.isArray(result.output) && result.output.length > 0) {
        resolve(JSON.stringify(result.output[0].data));
      }
    });
  });

  return pluginHookImportPostman(ctx, result);
}
