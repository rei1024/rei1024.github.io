import { bnb } from "../../../deps.ts";
import { APGMSourceSpan } from "../../ast/core.ts";
import { createSpan } from "./create_span.ts";

export const stringLit: bnb.Parser<{ value: string; span: APGMSourceSpan }> =
    bnb.location.chain((loc) => {
        return bnb.text(`"`).next(bnb.match(/[^"]*/)).skip(
            bnb.text(`"`),
        ).desc(["string"]).map((str) => {
            return {
                value: str,
                span: createSpan(loc, `"${str}"`),
            };
        });
    });
