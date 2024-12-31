import {format} from 'date-fns';
import {PluginConfig, PluginContext} from './types';

/**
 * Utility function to calculate the next version following CalVer (yyyy.MM).
 * @param lastVersion - The last version string (e.g., "2024.12.3").
 * @returns The next version string.
 */
export const calculateNextVersion = (lastVersion: string): string => {
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
export const generateNotes = async ({
  context
}: {
  pluginConfig?: PluginConfig;
  context: PluginContext;
}): Promise<string | undefined> => {
  return context.nextRelease?.notes;
};

/**
 * Prepares the next release by calculating the next version.
 * @param context - Plugin context containing release data.
 */
export const prepare = async ({
  context
}: {
  pluginConfig?: PluginConfig;
  context: PluginContext;
}): Promise<void> => {
  try {
    const lastVersion = context.lastRelease?.version ?? '1970.01.-1';
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
