import {VerifyReleaseContext as Context} from 'semantic-release';

export interface PluginConfig {}

export type PluginContext = Pick<Context, 'nextRelease' | 'lastRelease' | 'logger'>;
