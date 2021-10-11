import { execFile } from "child_process";
import * as path from "path";
import * as url from "url";
import * as util from "util";

import { withPreparedFilesystem } from "./filesystem";

const execFileP = util.promisify(execFile);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const script = path.join(__dirname, "es-node.js");

export const parseCoreDataWithSubprocess = async (
  resourceDir: string
): Promise<LoadError[]> => {
  const output = await withPreparedFilesystem(
    { resources: resourceDir },
    async ({ config, resources }) => {
      const { stderr } = await execFileP(process.execPath, [
        script,
        "-s",
        "--config",
        config,
        "--resources",
        resources,
      ]);
      return stderr;
    }
  );
  return parseErrors(output);
};

export const parsePluginWithSubprocess = async (
  pluginDir: string
): Promise<LoadError[]> => {
  let tmpPath: string | undefined;

  const output = await withPreparedFilesystem(
    { pluginDir },
    async ({ config, resources, tmpPlugin }) => {
      tmpPath = tmpPlugin;
      const { stderr } = await execFileP(process.execPath, [
        script,
        "-s",
        "--config",
        config,
        "--resources",
        resources,
      ]);
      return stderr;
    }
  );

  return parseErrors(output, (p) =>
    path.join(pluginDir, path.relative(tmpPath!, p))
  );
};

// DataNode::PrintTrace() always writes a blank line at the beginning
// essages can't begin with ( because shipEntityErrors have that (and might not have a blank line)
export const dataNodeError = /(?<=\n\n)(?<msg>.*)\nfile (?<quote>"?)(?<file>.*)\k<quote>(\nL(?<lineno>[0-9]+):(?<line>.*))+(?=\n)/g;

// Files::LogError always adds a newline, so sensible messages ending in \n
// produce a blank line after
export const shipEntityError = /(?<=\n)(?<entity>[(][^()]+(?<variant>[(][^()]*[)])?[)]):\n(?<msg>.*)\nhas outfits:(?<outfit>\n\t.*)*(?=\n\n)/g;

// Argosy: outfit "Me..." is equipped but not included
// these don't have blank lines on either side
export const shipMissingEquippedOutfit = /(?<=\n)(?<entity>.*?): (?<msg>outfit "(?<outfit>.*?)".*[.])(?=\n)/g;

export type LoadError = {
  file?: string;
  lineno?: number;
  message: string;
  fullMessage: string;
  pat: string;
};

// exported for testing
export const parseErrors = (
  output: string,
  fileResolver?: (path: string) => string
): LoadError[] => {
  const r = (p: string) => {
    // Endless Sky swaps \ for / so need to swap back
    if (path.sep === "\\") {
      p = p.replace(/\//g, "\\");
    }
    if (!fileResolver) return p;
    return fileResolver(p);
  };
  // Windows line endings!
  let s = output.replace(/\r\n/g, "\n");
  // add a \n at the beginning to avoid missing first message
  s = "\n" + s;

  const errors = [];

  for (const m of s.matchAll(dataNodeError)) {
    errors.push({
      file: r(m.groups!.file!),
      lineno: parseInt(m.groups!.lineno!, 10), // the last lineno captured
      message: m.groups!.msg!,
      fullMessage: m[0],
      pat: "dataNodeError",
    });
  }

  for (const m of s.matchAll(shipEntityError)) {
    errors.push({
      entity: r(m.groups!.entity!),
      file: undefined,
      lineno: undefined,
      message: m.groups!.msg,
      fullMessage: m[0],
      pat: "shipEntityError",
    });
  }

  for (const m of s.matchAll(shipMissingEquippedOutfit)) {
    errors.push({
      entity: r(m.groups!.entity!),
      file: undefined,
      lineno: undefined,
      message: m.groups!.msg,
      fullMessage: m[0],
      pat: "shipMissingOutfitEquipped",
    });
  }

  return errors;
};
