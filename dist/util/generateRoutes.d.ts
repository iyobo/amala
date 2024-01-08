/// <reference types="koa__router" />
import Router from '@koa/router';
import { AmalaOptions } from '../types/AmalaOptions';
import { AmalaMetadata } from '../types/metadata';
/**
 * Fill up router with routes
 * @param router
 * @param options
 * @param metadata
 */
export declare function generateRoutes(router: Router, options: AmalaOptions, metadata: AmalaMetadata): Promise<void>;
