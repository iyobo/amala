import "reflect-metadata";

// Controller decorators
export {Controller} from './controller/controller';

// endpoint decorators
export {Delete} from './endpoint/delete';
export {Get} from './endpoint/get';
export {Patch} from './endpoint/patch';
export {Post} from './endpoint/post';
export {Put} from './endpoint/put';
export {Version} from './endpoint/version';

// hybrid decorators (controller or endpoint)
export {Flow} from './hybrid/flow';

// argument decorators
export {Body} from './endpoint/arg/body';
export {Ctx} from './endpoint/arg/ctx';
export {CurrentUser} from './endpoint/arg/currentUser';
export {File} from './endpoint/arg/file';
export {Header} from './endpoint/arg/header';
export {Params} from './endpoint/arg/params';
export {Query} from './endpoint/arg/query';
export {Req} from './endpoint/arg/req';
export {Res} from './endpoint/arg/res';
export {Session} from './endpoint/arg/session';
export {State} from './endpoint/arg/state';