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
const index_1 = require("../index");
class PaymentInput {
    constructor() {
        this.iban = "not-an-iban";
    }
}
__decorate([
    (0, index_1.IsIBAN)({ whitelist: ["GB", "IE"] }, { message: "Enter a supported UK or Irish IBAN" }),
    __metadata("design:type", Object)
], PaymentInput.prototype, "iban", void 0);
describe("class-validator 0.15 re-exports", () => {
    it("supports IBAN options followed by validation options", () => {
        const errors = (0, index_1.validateSync)(new PaymentInput());
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toEqual({
            isIBAN: "Enter a supported UK or Irish IBAN"
        });
    });
});
//# sourceMappingURL=classValidator015.test.js.map