---
sidebar_position: 5
sidebar_label: Troubleshooting
---
# Troubleshooting

- If you get TS errors like

```
node_modules/class-validator/decorator/decorators.d.ts:161:45 - error TS2503: Cannot find namespace 'ValidatorJS'.
161 export declare function IsDecimal(options?: ValidatorJS.IsDecimalOptions, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
```

(e.g if using `sequelize-typescript`),  
Then this means you are likely experiencing dependency clashes.
We recommend using yarn for much improved dependency resolution or, if you must use npm, consider adding the following to your `tsconfig.json`:

`"typeRoots": ["./node_modules/*/node_modules/@types/"]`