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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("@koa/multer"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1024 }
});
let MulterController = class MulterController {
    single(file) {
        return {
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size
        };
    }
    fields(files) {
        return {
            fieldname: files.image[0].fieldname,
            originalname: files.image[0].originalname,
            size: files.image[0].size
        };
    }
};
__decorate([
    (0, index_1.Flow)([upload.single('image')]),
    (0, index_1.Post)('/single'),
    __param(0, (0, index_1.File)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MulterController.prototype, "single", null);
__decorate([
    (0, index_1.Flow)([upload.fields([{ name: 'image', maxCount: 1 }])]),
    (0, index_1.Post)('/fields'),
    __param(0, (0, index_1.File)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MulterController.prototype, "fields", null);
MulterController = __decorate([
    (0, index_1.Controller)('/multer')
], MulterController);
describe('@koa/multer support', () => {
    let nativeServer;
    let testServer;
    beforeAll(async () => {
        const { app } = await (0, index_1.bootstrapControllers)({
            attachRoutes: true,
            bodyParser: false,
            controllers: [MulterController],
            disableVersioning: true,
            openAPI: { enabled: false }
        });
        nativeServer = app.listen();
        testServer = (0, supertest_1.default)(nativeServer);
    });
    afterAll(done => {
        if (nativeServer.listening) {
            nativeServer.close(done);
        }
        else {
            done();
        }
    });
    it('injects a single file from ctx.request.file', async () => {
        const response = await testServer
            .post('/multer/single')
            .attach('image', Buffer.from('amala'), 'amala.txt')
            .expect(200);
        expect(response.body).toEqual({
            fieldname: 'image',
            originalname: 'amala.txt',
            size: 5
        });
    });
    it('preserves multiple-file injection from ctx.request.files', async () => {
        const response = await testServer
            .post('/multer/fields')
            .attach('image', Buffer.from('amala'), 'amala.txt')
            .expect(200);
        expect(response.body).toEqual({
            fieldname: 'image',
            originalname: 'amala.txt',
            size: 5
        });
    });
});
//# sourceMappingURL=multer.test.js.map