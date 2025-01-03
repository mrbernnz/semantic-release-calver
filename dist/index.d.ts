import { GenerateNotesContext, PluginConfig, PrepareContext } from './types';
/**
 * Generates release notes from the context.
 * @param context - Plugin context containing release data.
 * @returns The release notes or undefined.
 */
export declare const generateNotes: (pluginConfig: PluginConfig, context: GenerateNotesContext) => Promise<string | undefined>;
/**
 * Prepares the next release by calculating the next version.
 * @param context - Plugin context containing release data.
 */
export declare const prepare: (pluginConfig: PluginConfig, context: PrepareContext) => Promise<void>;
