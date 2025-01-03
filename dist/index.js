"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = exports.generateNotes = void 0;
const date_fns_1 = require("date-fns");
/**
 * Utility function to calculate the next version following CalVer (yyyy.MM).
 * @param lastVersion - The last version string (e.g., "2024.12.3").
 * @returns The next version string.
 */
const calculateNextVersion = (lastVersion) => {
    const formattedDate = (0, date_fns_1.format)(new Date(), 'yyyy.MM');
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
const generateNotes = async (pluginConfig, context) => {
    return context.nextRelease?.notes;
};
exports.generateNotes = generateNotes;
/**
 * Prepares the next release by calculating the next version.
 * @param context - Plugin context containing release data.
 */
const prepare = async (pluginConfig, context) => {
    try {
        const lastVersion = context.lastRelease?.version;
        const newVersion = calculateNextVersion(lastVersion);
        if (context.nextRelease) {
            context.nextRelease.version = newVersion;
            context.logger.log(`CalVer calculated: ${newVersion}`);
        }
    }
    catch (error) {
        context.logger.error('Error calculating next version:', error);
        throw error;
    }
};
exports.prepare = prepare;
