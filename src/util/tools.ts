export function isClass(type) {
    const str = type.toString();
    return str.indexOf('class ') > -1;
}
