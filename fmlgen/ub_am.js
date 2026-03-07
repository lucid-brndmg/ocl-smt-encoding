import {ModelEnv} from "./index.js";
import {gen_fml, mk_options} from "./utils.js"

import fs from "fs"
import path from "path";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const opt_sat = opts.sat
  const uml = {
    logic: "LIA",
    name: `am`,
    classes: {
      molecule: {name: "String", weight: "Int"},
      atom: {name: "String", weight: "Int", noble_gas: "Bool"}
    },
    assoc: [
      {
        participants: [
          ["molecule", "compound", 1, null, null],
          ["atom", "particle", 3, null, null]
        ]
      }
    ]
  }

  const e = new UnboundedEnv(uml, opts)
  e.assert_context(
    "atom",
    e.forall_instances("atom", (a) =>
      e.app(">", e.attr("atom", "weight", a), 0)
    ),
    e.forall_instances("atom", (a) =>
      e.assoc_each_distinct("atom", a, [], (i, j) => e.app("distinct", e.attr("atom", "weight", i), e.attr("atom", "weight", j)))
    )
  )

  e.assert_context(
    "molecule",
    e.forall_instances("molecule", (m) =>
      // e.app("=", 0, e.assoc_path_size_pb("molecule", m, ["particle"], ([m, a]) => e.attr("atom", "noble_gas", a)))
      e.forall_navigate("molecule", m, ["particle"], ([m, a]) => `(not ${e.attr("atom", "noble_gas", a)})`)
    )
  )

  if (!opt_sat) {
    e.unnamed(e.exists_instances("atom", (a) => e.attr("atom", "noble_gas", a)))
  }


  return e
}


export default gen
