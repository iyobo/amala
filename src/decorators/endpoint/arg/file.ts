import {addArgumentInjectMeta} from '../../common';

export function File() {
  return function (
    object: Record<string, any>,
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
