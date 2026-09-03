import {addArgumentInjectMeta} from '../../common';
import {ClassMethod} from '../../../types/metadata';

export function File() {
  return function (
    object: ClassMethod,
    methodName: string,
    index: number
  ): void {
    addArgumentInjectMeta({
      index,
      ctxKey: "request",
      // koa-body exposes `files`; @koa/multer exposes `file` for single uploads.
      // The request argument translator supports both while preserving this
      // metadata shape for existing consumers of getControllers().
      ctxValueOptions: "files",
      methodName,
      object
    });
  };
}
