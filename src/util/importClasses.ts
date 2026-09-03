import * as path from 'path';

/**
 * Loads all exported classes from the given directory.
 */
export function importClassesFromDirectories(globString: string, formats = ['.js', '.ts']): Function[] {

    const loadFileClasses = function (exported: unknown, allLoaded: Function[]) {
        if (typeof exported === 'function') {
            allLoaded.push(exported);
        } else if (Array.isArray(exported)) {
            exported.forEach(item => loadFileClasses(item, allLoaded));
        } else if (exported && typeof exported === 'object') {
            Object.values(exported).forEach(value => loadFileClasses(value, allLoaded));
        }

        return allLoaded;
    };

    // get absolute paths of each file that matches the glut
    const allFiles: string[] = require('glob').sync(path.normalize(globString));

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
