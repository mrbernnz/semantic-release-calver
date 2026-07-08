import SemanticReleaseError from '@semantic-release/error';
import {GenerateNotesContext, PluginConfig, VerifyReleaseContext} from './types';
import {DEFAULT_TAG_FORMAT, makeTag, VersionManager} from './utils';

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
 * Verifies and finalizes the next release version, overwriting the SemVer
 * default with a CalVer version. Runs during `verifyRelease`, which
 * semantic-release always executes (even in `--dry-run`), unlike `prepare`.
 * @param pluginConfig - Plugin configuration.
 * @param context - Plugin context containing release data.
 */
export const verifyRelease = async (
  pluginConfig: PluginConfig = {versionFormat: 'YYYY.0M.MICRO'},
  context: VerifyReleaseContext
): Promise<void> => {
  try {
    const lastVersion = context.lastRelease?.version;
    const versionManager = new VersionManager(pluginConfig.versionFormat);

    let calverBaseVersion: string | undefined = lastVersion;

    if (lastVersion && !versionManager.isValidVersion(lastVersion)) {
      if (!versionManager.isSemVer(lastVersion)) {
        throw new SemanticReleaseError(
          'Invalid Version Format',
          'EINVALIDVERSION',
          `The version "${lastVersion}" is not a valid SemVer or CalVer.`
        );
      }

      context.logger.log(`Detected SemVer last release "${lastVersion}"; migrating to CalVer.`);
      calverBaseVersion = undefined;
    }

    const newVersion = versionManager.calculateNextVersion(calverBaseVersion);

    if (context.nextRelease) {
      context.nextRelease.version = newVersion;
      context.nextRelease.gitTag = makeTag(context.options.tagFormat ?? DEFAULT_TAG_FORMAT, newVersion);
      context.nextRelease.name = context.nextRelease.gitTag;
      context.logger.log(`CalVer calculated: ${newVersion}`);
    }
  } catch (error) {
    context.logger.error('Error calculating next version:', error);
    throw error;
  }
};
