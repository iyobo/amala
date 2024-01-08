"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgController = void 0;
const class_validator_1 = require("class-validator");
const index_1 = require("../../../index");
const flow_1 = require("../flow/flow");
class ClassInput {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClassInput.prototype, "aString", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClassInput.prototype, "aNumber", void 0);
const CustomDeco = () => (0, index_1.Ctx)('query');
let ArgController = exports.ArgController = class ArgController {
    async twoParams(params, id) {
        return { params, id };
    }
    async bodyRequired(body) {
        return body;
    }
    async simpleBody(body) {
        return body;
    }
    async body(body) {
        return body;
    }
    async bodySpecific(foo) {
        return foo;
    }
    async bodyInterface(body) {
        return body;
    }
    async state(state) {
        return state;
    }
    async stateNoValue(foo) {
        return foo;
    }
    async user(user) {
        return user;
    }
    async header(header) {
        return header;
    }
    async query(q) {
        return q;
    }
    async querySingle(q) {
        return q;
    }
    async params(q) {
        return q;
    }
    async paramsSingle(id) {
        return id;
    }
    // Argument primitive casting
    async paramsCastNumber(val) {
        return { type: typeof val, val };
    }
    async paramsCastBoolean(val) {
        return { type: typeof val, val };
    }
    // sessions
    async session(sess) {
        return sess;
    }
    async sessionSingle(sess) {
        return sess;
    }
    async req(req) {
        return req.header;
    }
    async uploadBuffer(ctx, req) {
        return req.body;
    }
    async uploadFile(ctx, files) {
        return files;
    }
    async uploadFile2(ctx, req) {
        return req.files;
    }
    async res(res) {
        return res ? 'works' : 'did not work';
    }
    async ctx(ctx) {
        return ctx;
    }
    async ctx2(query) {
        return query;
    }
    async custom(query) {
        return query;
    }
    async multiPath(query) {
        return query;
    }
};
__decorate([
    (0, index_1.Post)('/:model/:id'),
    __param(0, (0, index_1.Params)()),
    __param(1, (0, index_1.Params)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "twoParams", null);
__decorate([
    (0, index_1.Post)('/bodyRequired'),
    __param(0, (0, index_1.Body)({ required: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClassInput]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "bodyRequired", null);
__decorate([
    (0, index_1.Post)('/bodySimple'),
    __param(0, (0, index_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "simpleBody", null);
__decorate([
    (0, index_1.Post)('/body'),
    __param(0, (0, index_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClassInput]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "body", null);
__decorate([
    (0, index_1.Post)('/bodySpecific'),
    __param(0, (0, index_1.Body)('foo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "bodySpecific", null);
__decorate([
    (0, index_1.Post)('/interface'),
    __param(0, (0, index_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "bodyInterface", null);
__decorate([
    (0, index_1.Flow)([flow_1.setSomethingStateFlow]),
    (0, index_1.Post)('/state'),
    __param(0, (0, index_1.State)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "state", null);
__decorate([
    (0, index_1.Post)('/stateNoValue'),
    __param(0, (0, index_1.State)('foo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "stateNoValue", null);
__decorate([
    (0, index_1.Flow)([flow_1.loginForTest]),
    (0, index_1.Get)('/user'),
    __param(0, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "user", null);
__decorate([
    (0, index_1.Post)('/header'),
    __param(0, (0, index_1.Header)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "header", null);
__decorate([
    (0, index_1.Get)('/query'),
    __param(0, (0, index_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "query", null);
__decorate([
    (0, index_1.Get)('/querySingle'),
    __param(0, (0, index_1.Query)('amala')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "querySingle", null);
__decorate([
    (0, index_1.Get)('/params/:id'),
    __param(0, (0, index_1.Params)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "params", null);
__decorate([
    (0, index_1.Get)('/paramsSingle/:id'),
    __param(0, (0, index_1.Params)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "paramsSingle", null);
__decorate([
    (0, index_1.Get)('/paramsCastNumber/:val'),
    __param(0, (0, index_1.Params)('val')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "paramsCastNumber", null);
__decorate([
    (0, index_1.Get)('/paramsCastBoolean/:val'),
    __param(0, (0, index_1.Params)('val')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "paramsCastBoolean", null);
__decorate([
    (0, index_1.Get)('/session'),
    (0, index_1.Flow)(flow_1.setSomethingSessionFlow),
    __param(0, (0, index_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "session", null);
__decorate([
    (0, index_1.Get)('/sessionSingle'),
    (0, index_1.Flow)(flow_1.setSomethingSessionFlow),
    __param(0, (0, index_1.Session)('amala')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "sessionSingle", null);
__decorate([
    (0, index_1.Post)('/req'),
    __param(0, (0, index_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "req", null);
__decorate([
    (0, index_1.Post)('/uploadBuffer'),
    __param(0, (0, index_1.Ctx)()),
    __param(1, (0, index_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "uploadBuffer", null);
__decorate([
    (0, index_1.Post)('/uploadFile'),
    __param(0, (0, index_1.Ctx)()),
    __param(1, (0, index_1.File)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "uploadFile", null);
__decorate([
    (0, index_1.Post)('/uploadFile2'),
    __param(0, (0, index_1.Ctx)()),
    __param(1, (0, index_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "uploadFile2", null);
__decorate([
    (0, index_1.Post)('/res'),
    __param(0, (0, index_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "res", null);
__decorate([
    (0, index_1.Post)('/ctx'),
    __param(0, (0, index_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "ctx", null);
__decorate([
    (0, index_1.Get)('/ctx2'),
    __param(0, (0, index_1.Ctx)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "ctx2", null);
__decorate([
    (0, index_1.Get)('/custom'),
    __param(0, CustomDeco()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "custom", null);
__decorate([
    (0, index_1.Get)(['/multiPath1', '/multiPath2']),
    __param(0, (0, index_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArgController.prototype, "multiPath", null);
exports.ArgController = ArgController = __decorate([
    (0, index_1.Controller)('/arg')
], ArgController);
//# sourceMappingURL=ArgController.js.map