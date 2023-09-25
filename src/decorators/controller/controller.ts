import {metadata, options} from '../../index';
import {AmalaMetadataController, Class} from '../../types/metadata';
import {ensureArray} from '../../util/tools';

export function Controller(baseRoute?: string | string[]) {
  return function (classDefinition: Class): void {

    // It is possible to define multiple routes to use the same controller
    const routes = ensureArray(baseRoute);

    let controller = metadata.controllers[classDefinition.name];
    if (controller) {
      // honestly, this should never be the case. It is not expected that a controller pre-exists...unless there was a dual scan
      controller.paths = routes;
      controller.targetClass = classDefinition;
    } else {
      controller = {
        paths: routes,
        targetClass: classDefinition,
        endpoints: {}
      };
    }

    metadata.controllers[classDefinition.name] = controller;

    if (options?.diagnostics) {
      console.info(`Amala: Registering controller ${classDefinition.name} at "${options.basePath}${options.disableVersioning ? '' : '/v...'}${routes}"`);
    }
  };
}