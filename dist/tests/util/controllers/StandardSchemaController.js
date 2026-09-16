"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardSchemaController = void 0;
const v = __importStar(require("valibot"));
const zod_1 = require("zod");
const index_1 = require("../../../index");
const orderSchema = zod_1.z.object({
    sku: zod_1.z.string().trim().min(1),
    // Coercion and defaults happen before the controller sees the order.
    quantity: zod_1.z.coerce.number().int().positive().default(1)
});
const valibotOrderSchema = v.object({
    sku: v.pipe(v.string(), v.trim(), v.minLength(1))
});
const asyncReferenceSchema = {
    '~standard': {
        version: 1,
        vendor: 'amala-test',
        async validate(value) {
            await Promise.resolve();
            return typeof value === 'string'
                ? { value: value.toUpperCase() }
                : { issues: [{ message: 'Reference must be a string' }] };
        }
    }
};
const throwingSchema = {
    '~standard': {
        version: 1,
        vendor: 'amala-test',
        validate() {
            throw new Error('private validator details');
        }
    }
};
const manyIssuesSchema = {
    '~standard': {
        version: 1,
        vendor: 'amala-test',
        validate: () => ({
            issues: Array.from({ length: 101 }, (_, index) => ({
                message: 'Invalid field',
                path: [{ key: 'nested' }, index]
            }))
        })
    }
};
let StandardSchemaController = class StandardSchemaController {
    async createOrder(order) {
        // This is already trimmed, coerced, defaulted, and type-safe.
        return order;
    }
    async normalizeSku(sku) {
        return { sku };
    }
    async createValibotOrder(order) {
        // Amala uses the shared contract; there is no Valibot-specific adapter.
        return order;
    }
    async list(page) {
        return { page, type: typeof page };
    }
    async getOrder(id) {
        return { id, type: typeof id };
    }
    async resolveReference(reference) {
        return { reference };
    }
    async validatorError(body) {
        return body;
    }
    async manyIssues(body) {
        return body;
    }
};
exports.StandardSchemaController = StandardSchemaController;
__decorate([
    (0, index_1.Post)('/orders'),
    __param(0, (0, index_1.Body)(orderSchema)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "createOrder", null);
__decorate([
    (0, index_1.Post)('/orders/sku'),
    __param(0, (0, index_1.Body)('sku', zod_1.z.string().trim().toUpperCase())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "normalizeSku", null);
__decorate([
    (0, index_1.Post)('/valibot'),
    __param(0, (0, index_1.Body)(valibotOrderSchema)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [void 0]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "createValibotOrder", null);
__decorate([
    (0, index_1.Get)('/pages'),
    __param(0, (0, index_1.Query)('page', zod_1.z.coerce.number().int().positive().default(1))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "list", null);
__decorate([
    (0, index_1.Get)('/orders/:id'),
    __param(0, (0, index_1.Params)('id', zod_1.z.coerce.number().int().positive())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "getOrder", null);
__decorate([
    (0, index_1.Get)('/references'),
    __param(0, (0, index_1.Query)('ref', asyncReferenceSchema)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "resolveReference", null);
__decorate([
    (0, index_1.Post)('/validator-error'),
    __param(0, (0, index_1.Body)(throwingSchema)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "validatorError", null);
__decorate([
    (0, index_1.Post)('/many-issues'),
    __param(0, (0, index_1.Body)(manyIssuesSchema)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StandardSchemaController.prototype, "manyIssues", null);
exports.StandardSchemaController = StandardSchemaController = __decorate([
    (0, index_1.Controller)('/standard-schema')
], StandardSchemaController);
//# sourceMappingURL=StandardSchemaController.js.map