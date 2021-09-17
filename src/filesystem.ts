import { tmpdir } from "os";
import {
  existsSync,
  mkdirSync,
  rmdirSync,
  mkdtempSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import * as path from "path";

type PreparedFilesystemOptions = {
  resources: string | undefined; // prepare a resources directory
  // TODO  config: string|undefined, // prepare a temp config directory
  pluginDir: string | undefined; // link in a plugin
  // TODO  pluginFile: string|undefined, // link in a plugin
};

type PreparedFilesystem = {
  config: string;
  resources: string;
  tmpPlugin: string | undefined;
};

export const TEMP_PLUGIN_NAME = "zzzTemp";

export async function withPreparedFilesystem<T>(
  options: Partial<PreparedFilesystemOptions>,
  cb: (filesystem: PreparedFilesystem) => Promise<T>
): Promise<T> {
  const configDir = mkdtempSync(path.join(tmpdir(), "es-config-"));
  mkdirSync(path.join(configDir, "saves"));
  mkdirSync(path.join(configDir, "plugins"));

  let tmpPlugin: string | undefined;
  let tmpResources: string | undefined;
  if (options.pluginDir) {
    // symlink it in!
    if (!existsSync(options.pluginDir)) {
      throw new Error("bad pluginDir path: " + options.pluginDir);
    }
    tmpPlugin = path.join(configDir, "plugins", TEMP_PLUGIN_NAME);
    symlinkSync(path.resolve(options.pluginDir), tmpPlugin);
  }
  if (!options.resources) {
    // if no resources, create blank one!
    tmpResources = mkdtempSync(path.join(tmpdir(), "es-resources-"));
    mkdirSync(path.join(tmpResources, "data"));
    mkdirSync(path.join(tmpResources, "sounds"));
    mkdirSync(path.join(tmpResources, "images"));
    writeFileSync(
      path.join(tmpResources, "credits.txt"),
      "mostly MZ but lots of help\n"
    );
  }

  try {
    return await cb({
      config: configDir,
      tmpPlugin,
      resources: tmpResources || options.resources!,
    });
  } finally {
    if (options.pluginDir) {
      unlinkSync(path.join(configDir, "plugins", TEMP_PLUGIN_NAME));
    }
    rmdirSync(configDir, { recursive: true });
    if (tmpResources) {
      rmdirSync(tmpResources, { recursive: true });
    }
  }
}
