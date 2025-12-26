import SemanticReleaseError from '@semantic-release/error';
import {GenerateNotesContext, PluginConfig, PrepareContext} from './types';
import {VersionManager} from './utils';

/**
 * Generates release notes from the context.
 * @param pluginConfig - Plugin configuration.
 * @param context - Plugin context containing release data.
 * @returns The release notes or undefined.
 */
export const generateNotes = async (
  pluginConfig: PluginConfig,
  context: GenerateNotesContext
): Promise<string | undefined> => context.nextRelease?.notes;

/**
 * Prepares the next release by calculating the next version.
 * @param pluginConfig - Plugin configuration.
 * @param context - Plugin context containing release data.
 */
export const prepare = async (
  pluginConfig: PluginConfig = {versionFormat: 'YYYY.0M.MICRO'},
  context: PrepareContext
): Promise<void> => {
  try {
    const lastVersion = context.lastRelease?.version;
    const versionManager = new VersionManager(pluginConfig.versionFormat);

    if (lastVersion && !versionManager.isValidVersion(lastVersion)) {
      throw new SemanticReleaseError(
        'Invalid Version Format',
        'EINVALIDVERSION',
        `The version "${lastVersion}" is not a valid SemVer or CalVer.`
      );
    }

    const newVersion = versionManager.calculateNextVersion(lastVersion);

    if (context.nextRelease) {
      context.nextRelease.version = newVersion;
      context.logger.log(`CalVer calculated: ${newVersion}`);
    }
  } catch (error) {
    context.logger.error('Error calculating next version:', error);
    throw error;
  }
};
