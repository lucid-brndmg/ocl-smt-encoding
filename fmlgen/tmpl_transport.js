import {ModelEnv, pb_and, pb_or, pb_singleton, pb_sum} from "./index.js";
import {gen_fml, mk_options} from "./utils.js";

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

  const e = new ModelEnv(uml, opts)

  const cr = "railway"
  const cs = "station"
  const ct = "train"
  const kr = e.bound_of(cr)

  e.assert_context(
    cs,
    e.forall_instances(cs, s => e.forall_navigate(cs, s, ["railways", "trains"], ([s, r, t]) => `(<= ${e.attr(ct, "v", t)} 0)`)),
    e.exists_instances(cs, s => `(> ${pb_sum(e.assoc_vec(cs, s, ["railways", "trains"]))} 0)`)
  )

  if (!sat) {
    e.assert_context(
      ct,
      e.forall_instances(ct, t => `(> ${e.attr(ct, "v", t)} 0)`)
    )

    if (!opts.unbounded_compatible) {
      e.assert_context(
        cr,
        e.forall_instances(cr, r => {
          const clp = e.assoc_closure_pb(
            cr,
            e.assoc_vec(cr, r, ["next"]),
            (a, b) => e.assoc_coords(cr, "next", a, b),
            `cl_nxt_${r}`
          )

          return `(= ${pb_sum(pb_and(e.assoc_vec(cr, r, ["previous"]), pb_or(clp, pb_singleton(kr, r))))} 0)`
        })
      )
    }
  }

  return e
}

export default gen

// gen_fml(gen(mk_options(false)))