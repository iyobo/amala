import {Type} from 'class-transformer';
import {IsNumber, IsPositive, IsString, ValidateNested} from 'class-validator';
import {Request, Response} from 'koa';
import {
  Context,
  Body,
  Controller,
  Ctx,
  CurrentUser, File,
  Flow,
  Get,
  Header,
  Params,
  Post,
  Query,
  Req,
  Res,
  Session,
  State
} from '../../../index';
import {loginForTest, setSomethingSessionFlow, setSomethingStateFlow} from '../flow/flow';

interface InterfaceInput {
  aString: string;

  aNumber: number;
}

type UploadedFile = Record<string, unknown> & {
  name?: unknown;
  type?: unknown;
};

class ClassInput {
  @IsString()
  aString: string;

  @IsNumber()
  aNumber: number;
}

class FileMetadataInput {
  @IsPositive()
  size: number;
}

class NestedFileInput {
  @ValidateNested()
  @Type(() => FileMetadataInput)
  metadata: FileMetadataInput;
}

const CustomDeco = ()=>Ctx('query');

@Controller('/arg')
export class ArgController {
  @Post('/:model/:id')
  async twoParams(@Params() params: Record<string, string>, @Params('id') id: string) {
    return {params, id};
  }

  @Post('/bodyRequired')
  async bodyRequired(@Body({required: true}) body: ClassInput) {
    return body;
  }

  @Post('/bodySimple')
  async simpleBody(@Body() body: unknown) {
    return body;
  }

  @Post('/body')
  async body(@Body() body: ClassInput) {
    return body;
  }

  @Post('/bodyNested')
  async bodyNested(@Body() body: NestedFileInput) {
    return body;
  }

  @Post('/bodySpecific')
  async bodySpecific(@Body('foo') foo: string) {
    return foo;
  }

  @Post('/interface')
  async bodyInterface(@Body() body: InterfaceInput) {
    return body;
  }

  @Flow([setSomethingStateFlow])
  @Post('/state')
  async state(@State() state: Record<string, unknown>) {
    return state;
  }

  @Post('/stateNoValue')
  async stateNoValue(@State('foo') foo: unknown) {
    return foo;
  }

  @Flow([loginForTest])
  @Get('/user')
  async user(@CurrentUser() user: Record<string, unknown>) {
    return user;
  }

  @Post('/header')
  async header(@Header() header: Record<string, string | string[] | undefined>) {
    return header;
  }

  @Get('/query')
  async query(@Query() q: Record<string, string | string[]>) {
    return q;
  }

  @Get('/querySingle')
  async querySingle(@Query('amala') q: string) {
    return q;
  }

  @Get('/params/:id')
  async params(@Params() q: Record<string, string>) {
    return q;
  }

  @Get('/paramsSingle/:id')
  async paramsSingle(@Params('id') id: string) {
    return id;
  }

  // Argument primitive casting
  @Get('/paramsCastNumber/:val')
  async paramsCastNumber(@Params('val') val: number) {
    return {type: typeof val, val};
  }

  @Get('/paramsCastBoolean/:val')
  async paramsCastBoolean(@Params('val') val: boolean) {
    return {type: typeof val, val};
  }


  // sessions
  @Get('/session')
  @Flow(setSomethingSessionFlow)
  async session(@Session() sess: Record<string, unknown>) {
    return sess;
  }

  @Get('/sessionSingle')
  @Flow(setSomethingSessionFlow)
  async sessionSingle(@Session('amala') sess: string) {
    return sess;
  }

  @Post('/req')
  async req(@Req() req: Request) {

    return req.header;
  }

  @Post('/uploadBuffer')
  async uploadBuffer(@Ctx() ctx: Context, @Req() req: Request): Promise<unknown> {
    return req.body;
  }

  @Post('/uploadFile')
  async uploadFile(@Ctx() ctx: Context, @File() files: Record<string, UploadedFile>) {
    const file = files?.testFile;
    if (!file) return undefined;
    return {testFile: {...file, name: file.name, type: file.type}};
  }

  @Post('/uploadFile2')
  async uploadFile2(@Ctx() ctx: Context, @Req() req: Request) {
    const file = (req.files as unknown as Record<string, UploadedFile> | undefined)?.testFile;
    if (!file) return undefined;
    return {testFile: {...file, name: file.name, type: file.type}};
  }

  @Post('/res')
  async res(@Res() res: Response) {
    return res ? 'works' : 'did not work';
  }

  @Post('/ctx')
  async ctx(@Ctx() ctx: Context) {
    return ctx;
  }

  @Get('/ctx2')
  async ctx2(@Ctx('query') query: Record<string, string | string[]>) {
    return query;
  }

  @Get('/custom')
  async custom(@CustomDeco() query: Record<string, string | string[]>) {
    return query;
  }

  @Get(['/multiPath1','/multiPath2'])
  async multiPath(@Query() query: Record<string, string | string[]>) {
    return query;
  }

}
