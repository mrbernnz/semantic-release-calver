import SemanticReleaseError from '@semantic-release/error';
import {format} from 'date-fns';
import semver from 'semver';
import {GenerateNotesContext, PluginConfig, PrepareContext} from './types';

/**
 * Validates whether a version string adheres to SemVer or CalVer specification.
 * @param version - The version string to validate.
 * @returns `true` if valid version, otherwise `false`.
 */
const isValidVersion = (version: string | undefined): boolean => {
  if (version === undefined) return true;
  return Boolean(semver.valid(version)) || /^\d{4}\.\d{2}(\.\d+)?$/.test(version);
};

/**
 * Utility function to calculate the next version following CalVer (yyyy.MM).
 * @param lastVersion - The last version string (e.g., "2024.12.3").
 * @returns The next version string.
 * @throws Error if the lastVersion is invalid.
 */
const calculateNextVersion = (lastVersion: string): string => {
  const formattedDate = format(new Date(), 'yyyy.MM');

  if (!lastVersion) {
    return `${formattedDate}.0`;
  }

  const versionSegments = lastVersion.split('.');

  if (!lastVersion || !isValidVersion(lastVersion) || versionSegments.length < 3) {
    throw new SemanticReleaseError(
      'Invalid CalVer Format',
      'EINVALIDCALVER',
      `The version "${lastVersion}" does not match the CalVer pattern.`
    );
  }

  const [, lastMonth, minor] = versionSegments;
  const lastMinor = formattedDate.includes(lastMonth) ? Number(minor) || 0 : -1;

  return `${formattedDate}.${lastMinor + 1}`;
};

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
  pluginConfig: PluginConfig,
  context: PrepareContext
): Promise<void> => {
  try {
    const lastVersion = context.lastRelease?.version;

    if (!isValidVersion(lastVersion)) {
      throw new SemanticReleaseError(
        'Invalid Version Format',
        'EINVALIDVERSION',
        `The version "${lastVersion}" is not a valid SemVer or CalVer.`
      );
    }

    const newVersion = calculateNextVersion(lastVersion);

    if (context.nextRelease) {
      context.nextRelease.version = newVersion;
      context.logger.log(`CalVer calculated: ${newVersion}`);
    }
  } catch (error) {
    context.logger.error('Error calculating next version:', error);
    throw error;
  }
};
