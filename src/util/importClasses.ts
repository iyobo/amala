import * as path from 'path';

/**
 * Loads all exported classes from the given directory.
 */
export function importClassesFromDirectories(globString: string, formats = ['.js', '.ts']): Function[] {

    const loadFileClasses = function (exported: any, allLoaded: Function[]) {
        if (exported instanceof Function) {
            allLoaded.push(exported);
        } else if (exported instanceof Array) {
            exported.forEach((i: any) => loadFileClasses(i, allLoaded));
        } else if (exported instanceof Object || typeof exported === 'object') {
            Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded));
        }

        return allLoaded;
    };

    // get absolute paths of each file that matches the glut
    const allFiles = require('glob').sync(path.normalize(globString));

    const dirs = allFiles
        .filter(file => {
            // ignore any .d.ts files
            const dtsExtension = file.substring(file.length - 5, file.length);
            return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts';
        })
        .map(file => {
            // Load it
            return require(file);
        });

    return loadFileClasses(dirs, []);
}