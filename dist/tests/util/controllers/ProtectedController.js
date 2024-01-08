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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedController = void 0;
const index_1 = require("../../../index");
const flow_1 = require("../flow/flow");
let ProtectedController = exports.ProtectedController = class ProtectedController {
    async hello() {
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
    async someRoute() {
        return "mmm";
    }
    async v1OnlyRoute() {
        return "mmm for v1";
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
};
__decorate([
    (0, index_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "hello", null);
__decorate([
    (0, index_1.Post)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "postRoute", null);
__decorate([
    (0, index_1.Patch)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "patchRoute", null);
__decorate([
    (0, index_1.Put)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "putRoute", null);
__decorate([
    (0, index_1.Delete)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "deleteRoute", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "someRoute", null);
__decorate([
    (0, index_1.Get)("/mmm"),
    (0, index_1.Version)("1"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "v1OnlyRoute", null);
__decorate([
    (0, index_1.Get)("/passFlow"),
    (0, index_1.Flow)([flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "passFlow", null);
__decorate([
    (0, index_1.Get)("/unauthorized"),
    (0, index_1.Flow)([flow_1.unauthorizedFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "unauthorized", null);
__decorate([
    (0, index_1.Get)("/multiFlow"),
    (0, index_1.Flow)([flow_1.passFlow, flow_1.passFlow, flow_1.passFlow]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProtectedController.prototype, "multiFlow", null);
exports.ProtectedController = ProtectedController = __decorate([
    (0, index_1.Controller)("/protected"),
    (0, index_1.Flow)([flow_1.unauthorizedFlow])
], ProtectedController);
//# sourceMappingURL=ProtectedController.js.map