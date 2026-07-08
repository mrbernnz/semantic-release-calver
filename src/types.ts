export interface CalculateNextVersionArgs {
  lastVersion: string;
  versionFormat: VersionFormat;
}

export interface DetermineFormatArgs {
  formattedDate: string;
  lastMinor: number;
  versionFormat: VersionFormat;
}

export type VersionFormat = 'YYYY.0M.MICRO' | 'YYYY.0M_MICRO';

export interface PluginConfig {
  versionFormat: VersionFormat;
}

/**
 * Locally-owned mirror of the fields this plugin reads from
 * semantic-release's `context.lastRelease`. Deliberately decoupled from
 * semantic-release's own bundled types, which are entirely absent in
 * semantic-release <21.1 and would otherwise break TypeScript consumers on
 * the lower end of this package's declared `>=19.0.0` peer range.
 */
export interface LastRelease {
  version: string;
}

/** Locally-owned mirror of the fields this plugin reads or writes on `context.nextRelease`. */
export interface NextRelease {
  notes?: string;
  version: string;
  gitTag: string;
  name: string;
}

/** Minimal subset of semantic-release's logger that this plugin calls. */
export interface Logger {
  log(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface GenerateNotesContext {
  nextRelease?: NextRelease;
}

export interface VerifyReleaseContext {
  lastRelease?: LastRelease;
  nextRelease?: NextRelease;
  options: {
    tagFormat?: string;
  };
  logger: Logger;
}
