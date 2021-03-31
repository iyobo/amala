import {metadata} from '../index';
import {ValidationDecoratorOptions} from '../decorators';

export function isClass(type) {
  const str = type.toString();
  return str.indexOf('class ') > -1;
}

interface AddArgumentProps {
  index: number;
  injectSource: string;
  injectOptions: string | ValidationDecoratorOptions;
  methodName: string;
  object: any;
}
// argument injection decorators
export function addArgumentInjectMeta({
                                        index,
                                        injectSource,
                                        injectOptions,
                                        methodName,
                                        object
                                      }: AddArgumentProps) {
  // console.log('argument', stackConfig, injectSource, injectOptions, object, methodName);
  const controller = metadata.controllers[object.constructor.name] || {};
  controller.actions = controller.actions || {};
  controller.actions[methodName] = controller.actions[methodName] || {};

  controller.actions[methodName].arguments =
    controller.actions[methodName].arguments || {};
  controller.actions[methodName].arguments[index] = {
    injectSource,
    injectOptions
  };

  metadata.controllers[object.constructor.name] = controller;
}
