import { describe, expect, it } from "vitest";
import { El } from "../../src/core/element";
import { NamecheapParseError } from "../../src/core/errors";
import { parsePaging } from "../../src/core/paging";
import { parseXml } from "../../src/core/xml";

const el = (xml: string): El => new El(parseXml(xml));

describe("parsePaging", () => {
  it("reads TotalItems, CurrentPage and PageSize", () => {
    const paging = parsePaging(
      el(
        "<Paging><TotalItems>41</TotalItems><CurrentPage>2</CurrentPage><PageSize>20</PageSize></Paging>",
      ),
    );
    expect(paging).toEqual({ totalItems: 41, currentPage: 2, pageSize: 20 });
  });

  it("throws NamecheapParseError when a field is missing or not numeric", () => {
    expect(() => parsePaging(el("<Paging><TotalItems>1</TotalItems></Paging>"))).toThrow(
      NamecheapParseError,
    );
    expect(() =>
      parsePaging(
        el(
          "<Paging><TotalItems>x</TotalItems><CurrentPage>1</CurrentPage><PageSize>1</PageSize></Paging>",
        ),
      ),
    ).toThrow(NamecheapParseError);
  });
});
