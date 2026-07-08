import semver from 'semver';
import {DetermineFormatArgs, VersionFormat} from './types';

/**
 * semantic-release's own default `tagFormat`, used when `context.options.tagFormat`
 * is not set. Mirrors the default in semantic-release's `get-config.js`.
 */
export const DEFAULT_TAG_FORMAT = 'v${version}';

/**
 * Substitutes the `${version}` token in a semantic-release `tagFormat` string.
 *
 * Unlike semantic-release's own `makeTag` (which compiles `tagFormat` as a
 * lodash template), this only replaces the literal `${version}` placeholder —
 * it does not support lodash/ERB-style delimiters (e.g. `<%= version %>`) or
 * expressions inside the placeholder.
 * @param tagFormat - The tag format (e.g. `v${version}`).
 * @param version - The version to interpolate.
 * @returns The formatted git tag.
 */
export function makeTag(tagFormat: string, version: string): string {
  return tagFormat.replace(/\$\{version\}/g, version);
}

export class VersionManager {
  private versionFormat: VersionFormat;

  constructor(versionFormat: VersionFormat) {
    this.versionFormat = versionFormat;
  }

  /**
   * Validates whether a version string adheres to SemVer or CalVer specification.
   * @param version - The version string to validate.
   * @returns `true` if valid version, otherwise `false`.
   */
  isValidVersion(version: string | undefined): boolean {
    if (!version) return false;

    if (!version.includes('_') && !semver.valid(version, {loose: true})) return false;

    const versionParts = this.getVersionSegments(version);
    if (versionParts.length !== 3) return false;

    const [yearStr, monthStr, microStr] = versionParts;

    const year = Number(yearStr);
    if (Number.isNaN(year) || year < 2000 || year > new Date().getFullYear()) return false;

    const month = Number(monthStr);
    if (Number.isNaN(month) || month < 1 || month > 12 || monthStr.length !== 2) return false;

    const micro = Number(microStr);
    if (Number.isNaN(micro) || micro < 1 || micro > 9999) return false;

    if (version.includes('_')) {
      if (!/^(0[1-9]|[1-9]\d{1,3})$/.test(microStr)) return false;
    } else {
      if (microStr.startsWith('0')) return false;
    }

    return true;
  }

  /**
   * Determines whether a version string is a valid SemVer version, regardless
   * of whether it is also CalVer-shaped. Used to detect a pre-existing SemVer
   * release history that predates CalVer adoption.
   * @param version - The version string to check.
   * @returns `true` if valid SemVer, otherwise `false`.
   */
  isSemVer(version: string): boolean {
    return semver.valid(version, {loose: true}) !== null;
  }

  /**
   * Determines whether a version string is CalVer-shaped - i.e. its first two
   * segments read as a plausible year and zero-padded month - even though it
   * fails full `isValidVersion` validation (e.g. a missing MICRO segment).
   * @param version - The version string to check.
   * @returns `true` if the leading segments look like YYYY and 0M, otherwise `false`.
   */
  isCalVerShaped(version: string): boolean {
    const [yearStr, monthStr] = this.getVersionSegments(version);
    if (!yearStr || !monthStr) return false;

    const year = Number(yearStr);
    if (!/^\d+$/.test(yearStr) || Number.isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
      return false;
    }

    const month = Number(monthStr);
    if (!/^\d{2}$/.test(monthStr) || Number.isNaN(month) || month < 1 || month > 12) {
      return false;
    }

    return true;
  }

  /**
   * Calculates the next version following CalVer (i.e. YYYY.0M.MICRO).
   * @param lastVersion - The last version string (e.g., "2024.12.3").
   * @returns The next version string.
   * @throws Error if the lastVersion is invalid.
   */
  calculateNextVersion(lastVersion: string | undefined): string {
    const formattedDate = this.getFormattedDate();

    if (!lastVersion) {
      return `${formattedDate}.1`;
    }

    const versionSegments = this.getVersionSegments(lastVersion);

    if (!lastVersion || !this.isValidVersion(lastVersion) || versionSegments.length < 3) {
      throw new Error(
        `Invalid CalVer Format: The version "${lastVersion}" does not match the CalVer pattern.`
      );
    }

    const [, lastMonth, minor] = versionSegments;
    const lastMinor = formattedDate.includes(lastMonth) ? Number(minor) || 0 : -1;

    return this.determineFormat({formattedDate, lastMinor, versionFormat: this.versionFormat});
  }

  private getFormattedDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
  }

  private determineFormat({formattedDate, lastMinor, versionFormat}: DetermineFormatArgs): string {
    if (versionFormat === 'YYYY.0M_MICRO') {
      return `${formattedDate}_${String(lastMinor + 1).padStart(2, '0')}`;
    }

    return `${formattedDate}.${lastMinor + 1}`;
  }

  private getVersionSegments(version: string): string[] {
    if (!version) return [];
    return version.split(/[._]/);
  }
}
