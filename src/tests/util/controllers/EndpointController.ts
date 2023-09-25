import {
  Controller,
  Delete,
  Flow,
  Get, Params,
  Patch,
  Post,
  Put,
  State,
  Version
} from "../../../index";
import { passFlow, unauthorizedFlow, badFlow } from "../flow/flow";

@Controller("/endpoint")
export class EndpointController {
  @Get("/")
  async getRoute() {
    return "okay";
  }

  @Post("/")
  async postRoute() {
    return "okay";
  }

  @Patch("/")
  async patchRoute() {
    return "okay";
  }

  @Put("/")
  async putRoute() {
    return "okay";
  }

  @Delete("/")
  async deleteRoute() {
    return "okay";
  }

  @Get("/mmm")
  @Version("1", "Do not use")
  async mmmV1() {
    return "mmm for v1";
  }

  @Get("/mmm")
  async mmm() {
    return "mmm";
  }

  @Get("/passFlow")
  @Flow([passFlow])
  async passFlow() {
    return "I was allowed";
  }

  @Get("/unauthorized")
  @Flow([unauthorizedFlow])
  async unauthorized() {
    return 'You\'ll never see this';
  }

  @Get("/badFlow")
  @Flow([badFlow])
  async badFlow() {
    return 'You\'ll never see this too';
  }

  @Get("/multiFlow")
  @Flow([passFlow, passFlow, passFlow])
  async multiFlow() {
    return "multiFlow allowed";
  }

  @Get("/staten")
  async staten(@State() state: any) {
    return state;
  }

  // ---
  @Get("/usedByThis")
  async usedByThis(@Params() p) {
    return p;
  }

  @Get("/usedByThis2")
  async usedByThis2(p) {
    return {res:p};
  }

  @Get("/this")
  async usingThis() {
    return await this.usedByThis(123);
  }

  @Get("/this2")
  async usingThis2() {
    return await this.usedByThis2(456);
  }
}
