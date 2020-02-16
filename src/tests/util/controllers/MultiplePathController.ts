import { Controller, Get } from "../../../index";

@Controller(["/multiple1", "/multiple2"])
export class MultiplePathController {
  @Get("/")
  async get() {
    return "okay";
  }
}
