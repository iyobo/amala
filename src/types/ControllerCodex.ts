export interface ControllerCodex {
  [k: string]: {
    endpoints: {
      [ak: string]: {
        flow?: Array<Function>;
        verb: string;
        path: string;
        target: Function;
        argumentTypes?: Array<any>;
      };
    };
    path: string | string[];
    class: any;
  };
}