import {ModelEnv} from "./index.js";
import {gen_fml} from "./utils.js";

const gen = opts => {
  const sat = opts.sat
  const uml = {
    name: `ds`,
    classes: {
      A: {a: "Int"},
      B: {b: "Int", _extends: ["A"]},
      C: {c: "Int", _extends: ["A"]},
      D: {d: "Int", _extends: ["B", "C"]}
    },
    assoc: []
  }

  const e = new ModelEnv(uml, opts)

  if (!sat) {
    e.assert_context(
      "B",
      e.forall_instances("B", b => e.forall_instances("C", c  =>
        e.exists_cast("B", b, "A", (a1) => e.exists_cast("C", c, "A", (a2) => `(distinct ${a1} ${a2})`))
      ))
    )
  }

  return e
}


export default gen