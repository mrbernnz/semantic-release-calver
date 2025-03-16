import semver from 'semver';
import {DetermineFormatArgs} from './types';

/**
 * Validates whether a version string adheres to SemVer or CalVer specification.
 * @param version - The version string to validate.
 * @returns `true` if valid version, otherwise `false`.
 */
export const invalidVersion = (version: string | undefined): boolean => {
  if (!version) return true;

  if (!version.includes('_') && !semver.valid(version, {loose: true})) return true;

  const versionParts = version.split(/[._]/);
  if (versionParts.length !== 3) return true;

  const [yearStr, monthStr, microStr] = versionParts;

  const year = Number(yearStr);
  if (Number.isNaN(year) || year < 2000 || year > new Date().getFullYear()) return true;

  const month = Number(monthStr);
  if (Number.isNaN(month) || month < 1 || month > 12 || monthStr.length !== 2) return true;

  const micro = Number(microStr);
  if (Number.isNaN(micro) || micro < 1 || micro > 9999) return true;

  if (version.includes('_')) {
    if (!/^(0[1-9]|[1-9]\d{1,3})$/.test(microStr)) return true;
  } else {
    if (microStr.startsWith('0')) return true;
  }

  return false;
};

export const determineFormat = ({
  formattedDate,
  lastMinor,
  versionFormat
}: DetermineFormatArgs): string => {
  if (versionFormat === 'YYYY.0M_MICRO') {
    return `${formattedDate}_${String(lastMinor + 1).padStart(2, '0')}`;
  }

  return `${formattedDate}.${lastMinor + 1}`;
};

export const getVersionSegments = (version: string) => {
  if (!version) return [];
  return version.split(/[._]/);
};
