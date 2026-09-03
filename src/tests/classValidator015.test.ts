import {IsIBAN, validateSync} from "../index";

class PaymentInput {
  @IsIBAN(
    {whitelist: ["GB", "IE"]},
    {message: "Enter a supported UK or Irish IBAN"}
  )
  iban = "not-an-iban";
}

describe("class-validator 0.15 re-exports", () => {
  it("supports IBAN options followed by validation options", () => {
    const errors = validateSync(new PaymentInput());

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      isIBAN: "Enter a supported UK or Irish IBAN"
    });
  });
});
