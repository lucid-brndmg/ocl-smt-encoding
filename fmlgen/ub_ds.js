import {ModelEnv} from "./index.js";
import {gen_fml} from "./utils.js";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const uml = {
    name: `ds`,
    classes: {
      A: {},
      B: {_extends: ["A"]},
      C: {_extends: ["A"]},
      D: {_extends: ["B", "C"]}
    },
    assoc: []
  }

  const e = new UnboundedEnv(uml, opts)

  if (!opts.sat) {
    e.assert_context(
      "B",
      e.forall_instances("B", (b) => e.forall_instances("C", (c) =>
        e.exists_cast("B", b, "A", (a1) => e.exists_cast("C", c, "A", (a2) => `(distinct ${a1} ${a2})`))
      ))
    )
  }

  return e
}


export default gen