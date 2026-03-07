import {ModelEnv, pb_and, pb_or, pb_singleton, pb_sum} from "./index.js";
import {gen_fml, mk_options} from "./utils.js";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const sat = opts.sat
  const uml = {
    name: "transport",
    logic: "LIRA",
    classes: {
      train: {v: "Real"},
      railway: {},
      station: {}
    },
    assoc: [
      {
        participants: [
          ["station", "station", 0, null, 1],
          ["railway", "railways", 2, null, null]
        ]
      },
      {
        participants: [
          ["railway", "railway", null, 1, null],
          ["train", "trains", null, null, null]
        ]
      },
      {
        participants: [
          ["railway", "previous", 1, null, null],
          ["railway", "next", null, null, null]
        ]
      }
    ]
  }

  const e = new UnboundedEnv(uml, opts)

  const cr = "railway"
  const cs = "station"
  const ct = "train"

  e.assert_context(
    cs,
    e.forall_instances(cs, s => e.forall_navigate(cs, s, ["railways", "trains"], ([s, r, t]) => `(<= ${e.attr(ct, "v", t)} 0)`)),
    e.exists_instances(cs, s => e.not_empty(cs, s, ["railways", "trains"]))
  )

  if (!sat) {
    e.assert_context(
      ct,
      e.forall_instances(ct, t => `(> ${e.attr(ct, "v", t)} 0)`)
    )
  }

  return e
}

export default gen

