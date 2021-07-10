import {IsNumber, IsString} from 'class-validator';
import {Request, Response} from 'koa';
import {
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

class ClassInput {
  @IsString()
  aString: string;

  @IsNumber()
  aNumber: number;
}

const CustomDeco = ()=>Ctx('query');

@Controller('/arg')
export class ArgController {
  @Post('/:model/:id')
  async twoParams(@Params() params: any, @Params('id') id: any) {
    return {params, id};
  }

  @Post('/bodyRequired')
  async bodyRequired(@Body({required: true}) body: ClassInput) {
    return body;
  }

  @Post('/bodySimple')
  async simpleBody(@Body() body: any) {
    return body;
  }

  @Post('/body')
  async body(@Body() body: ClassInput) {
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
  async state(@State() state: any) {
    return state;
  }

  @Flow([loginForTest])
  @Get('/user')
  async user(@CurrentUser() user: any) {
    return user;
  }

  @Post('/header')
  async header(@Header() header: any) {
    return header;
  }

  @Get('/query')
  async query(@Query() q: any) {
    return q;
  }

  @Get('/querySingle')
  async querySingle(@Query('amala') q: string) {
    return q;
  }

  @Get('/params/:id')
  async params(@Params() q: any) {
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

  // sessions
  @Get('/session')
  @Flow(setSomethingSessionFlow)
  async session(@Session() sess: any) {
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
  async uploadBuffer(@Ctx() ctx, @Req() req: Request) {
    return req.body;
  }

  @Post('/uploadFile')
  async uploadFile(@Ctx() ctx, @File() files: Record<string,File>) {
    return files;
  }

  @Post('/uploadFile2')
  async uploadFile2(@Ctx() ctx, @Req() req: Request) {
    return req.files;
  }

  @Post('/res')
  async res(@Res() res: Response) {
    return res ? 'works' : 'did not work';
  }

  @Post('/ctx')
  async ctx(@Ctx() ctx: any) {
    return ctx;
  }

  @Get('/ctx2')
  async ctx2(@Ctx('query') query: any) {
    return query;
  }

  @Get('/custom')
  async custom(@CustomDeco() query: any) {
    return query;
  }

}
