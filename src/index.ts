import {format} from 'date-fns';
import {GenerateNotesContext, PluginConfig, PrepareContext} from './types';

/**
 * Utility function to calculate the next version following CalVer (yyyy.MM).
 * @param lastVersion - The last version string (e.g., "2024.12.3").
 * @returns The next version string.
 */
const calculateNextVersion = (lastVersion: string): string => {
  const formattedDate = format(new Date(), 'yyyy.MM');

  const [_, lastMonth, minor] = lastVersion.split('.');
  const lastMinor = formattedDate.includes(lastMonth) ? Number(minor) || 0 : -1;
  const nextMinor = lastMinor + 1;

  return `${formattedDate}.${nextMinor}`;
};

/**
 * Generates release notes from the context.
 * @param context - Plugin context containing release data.
 * @returns The release notes or undefined.
 */
export const generateNotes = async (
  pluginConfig: PluginConfig,
  context: GenerateNotesContext
): Promise<string | undefined> => {
  return context.nextRelease?.notes;
};

/**
 * Prepares the next release by calculating the next version.
 * @param context - Plugin context containing release data.
 */
export const prepare = async (
  pluginConfig: PluginConfig,
  context: PrepareContext
): Promise<void> => {
  try {
    const lastVersion = context.lastRelease?.version;
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
