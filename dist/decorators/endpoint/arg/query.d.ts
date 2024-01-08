import { ValidationDecoratorOptions } from '../../common';
export declare function Query(injectOptions?: string | ValidationDecoratorOptions): (object: Record<string, any>, methodName: string, index: number) => void;
