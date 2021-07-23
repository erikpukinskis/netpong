import * as Colors from "https://deno.land/std@0.100.0/fmt/colors.ts";

export const log = {
  event: (event: string, ...strings: string[]) => {
    console.log(Colors.cyan(`  [${event}]`), ...strings);
  },
};

interface Stringable {
  toString(): string;
}

export function datum(
  text: Stringable,
  { stringify, shorten }: { stringify?: boolean; shorten?: boolean } = {}
) {
  if (typeof text === "number" || !shorten) return Colors.gray(text.toString());
  if (stringify) return Colors.gray(JSON.stringify(text));
  return Colors.gray(text.toString().split("-")[0].slice(0, 4) + "..");
}
