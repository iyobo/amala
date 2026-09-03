import { ValidationDecoratorOptions } from '../../common';
import { ClassMethod } from '../../../types/metadata';
export declare function Body(injectOptions?: string | ValidationDecoratorOptions): (object: ClassMethod, methodName: string, index: number) => void;
