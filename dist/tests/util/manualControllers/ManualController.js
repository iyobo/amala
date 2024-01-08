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
exports.ManualController = void 0;
const index_1 = require("../../../index");
const flow_1 = require("../flow/flow");
let ManualController = exports.ManualController = class ManualController {
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
    async multiFlow() {
        return "multiFlow allowed";
    }
    async staten(state) {
        return state;
    }
};
__decorate([
    (0, index_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "getRoute", null);
__decorate([
    (0, index_1.Post)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "postRoute", null);
__decorate([
    (0, index_1.Patch)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "patchRoute", null);
__decorate([
    (0, index_1.Put)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "putRoute", null);
__decorate([
    (0, index_1.Delete)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "deleteRoute", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    (0, index_1.Version)("1", "Do not use"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "mmmV1", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "mmm", null);
__decorate([
    (0, index_1.Get)("/passFlow"),
    (0, index_1.Flow)([flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "passFlow", null);
__decorate([
    (0, index_1.Get)("/unauthorized"),
    (0, index_1.Flow)([flow_1.unauthorizedFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "unauthorized", null);
__decorate([
    (0, index_1.Get)("/multiFlow"),
    (0, index_1.Flow)([flow_1.passFlow, flow_1.passFlow, flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "multiFlow", null);
__decorate([
    (0, index_1.Get)("/staten"),
    __param(0, (0, index_1.State)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManualController.prototype, "staten", null);
exports.ManualController = ManualController = __decorate([
    (0, index_1.Controller)("/manual")
], ManualController);
//# sourceMappingURL=ManualController.js.map