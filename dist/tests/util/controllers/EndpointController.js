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
exports.EndpointController = void 0;
const index_1 = require("../../../index");
const flow_1 = require("../flow/flow");
let EndpointController = exports.EndpointController = class EndpointController {
    async getRoute() {
        return "okay";
    }
    async postRoute() {
        return "okay";
    }
    async patchRoute() {
        return "okay";
    }
    async putRoute() {
        return "okay";
    }
    async deleteRoute() {
        return "okay";
    }
    async mmmV1() {
        return "mmm for v1";
    }
    async mmm() {
        return "mmm";
    }
    async passFlow() {
        return "I was allowed";
    }
    async unauthorized() {
        return 'You\'ll never see this';
    }
    async badFlow() {
        return 'You\'ll never see this too';
    }
    async multiFlow() {
        return "multiFlow allowed";
    }
    async staten(state) {
        return state;
    }
    // ---
    async usedByThis(p) {
        return p;
    }
    async usedByThis2(p) {
        return { res: p };
    }
    async usingThis() {
        return await this.usedByThis(123);
    }
    async usingThis2() {
        return await this.usedByThis2(456);
    }
};
__decorate([
    (0, index_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "getRoute", null);
__decorate([
    (0, index_1.Post)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "postRoute", null);
__decorate([
    (0, index_1.Patch)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "patchRoute", null);
__decorate([
    (0, index_1.Put)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "putRoute", null);
__decorate([
    (0, index_1.Delete)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "deleteRoute", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    (0, index_1.Version)("1", "Do not use"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "mmmV1", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "mmm", null);
__decorate([
    (0, index_1.Get)("/passFlow"),
    (0, index_1.Flow)([flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "passFlow", null);
__decorate([
    (0, index_1.Get)("/unauthorized"),
    (0, index_1.Flow)([flow_1.unauthorizedFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "unauthorized", null);
__decorate([
    (0, index_1.Get)("/badFlow"),
    (0, index_1.Flow)([flow_1.badFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "badFlow", null);
__decorate([
    (0, index_1.Get)("/multiFlow"),
    (0, index_1.Flow)([flow_1.passFlow, flow_1.passFlow, flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "multiFlow", null);
__decorate([
    (0, index_1.Get)("/staten"),
    __param(0, (0, index_1.State)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "staten", null);
__decorate([
    (0, index_1.Get)("/usedByThis"),
    __param(0, (0, index_1.Params)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "usedByThis", null);
__decorate([
    (0, index_1.Get)("/usedByThis2"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "usedByThis2", null);
__decorate([
    (0, index_1.Get)("/this"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "usingThis", null);
__decorate([
    (0, index_1.Get)("/this2"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndpointController.prototype, "usingThis2", null);
exports.EndpointController = EndpointController = __decorate([
    (0, index_1.Controller)("/endpoint")
], EndpointController);
//# sourceMappingURL=EndpointController.js.map