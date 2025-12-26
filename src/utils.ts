import semver from 'semver';
import {DetermineFormatArgs, VersionFormat} from './types';

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
