export interface CalculateNextVersionArgs {
  lastVersion: string;
  versionFormat: VersionFormat;
}

export interface DetermineFormatArgs {
  formattedDate: string;
  lastMinor: number;
  versionFormat: VersionFormat;
}

export {GenerateNotesContext, PrepareContext} from 'semantic-release';

export type VersionFormat = 'YYYY.0M.MICRO' | 'YYYY.0M_MICRO';

export interface PluginConfig {
  versionFormat: VersionFormat;
}
