import {ModelEnv, pb_exists, pb_forall, pb_or} from "./index.js";
import {gen_fml} from "./utils.js";

const gen = opts => {
  const uml = {
    name: "oai",
    classes: {
      integer: {},
      zero: {_extends: ["integer"]},
      neg: {_extends: ["integer"]},
      pos: {_extends: ["integer"]}
    },
    assoc: [
      {
        participants: [
          ["integer", "succ", 0, null, 1],
          ["integer", "pred", 0, null, 1]
        ]
      }
    ]
  }

  const k = opts.bound

  const e = new ModelEnv(uml, opts)
  const ci = "integer"
  const cz = "zero"
  const cn = "neg"
  const cp = "pos"

  const cl_pred = []
  const cl_succ = []
  const cl_union = []

  for (let i = 0; i < k; i++) {
    const clp = e.assoc_closure_pb(
      ci,
      e.assoc_vec(ci, i, ["pred"]),
      (a, b) => e.assoc_coords(ci, "pred", a, b),
      `cl_pred_${i}`
    )
    cl_pred.push(clp)

    const cls = e.assoc_closure_pb(
      ci,
      e.assoc_vec(ci, i, ["succ"]),
      (a, b) => e.assoc_coords(ci, "succ", a, b),
      `cl_succ_${i}`
    )
    cl_succ.push(cls)

    cl_union.push(pb_or(clp, cls))
  }

  e.assert_context(
    ci,
    e.forall_instances(ci, i => `(not (and ${cl_union[i].join(" ")}))`),
  )

  e.assert_context(
    cz,
    e.forall_instances(cz, z => `(not ${e.exists_cast(cz, z, ci, i => {
      const entry = cl_union[i]
      return pb_exists(entry, i2 => e.exists_cast(ci, i2, cz))
    })})`),

    e.forall_instances(cz, z => `(not ${e.exists_cast(cz, z, ci, i => {
      const entry = cl_union[i]
      return `(and ${pb_exists(entry, i2 => e.exists_cast(ci, i2, cn))} ${pb_exists(entry, i2 => e.exists_cast(ci, i2, cp))})`
    })})`),
  )

  e.assert_context(
    cn,
    e.forall_instances(cn, n => `(not ${e.exists_cast(cn, n, ci, i => {
      const entry = cl_union[i]
      return pb_exists(entry, i2 => e.exists_cast(ci, i2, cp))
    })})`),

    e.forall_instances(cn, n => e.exists_cast(cn, n, ci, i => {
      const entry = cl_succ[i]
      return pb_exists(entry, i2 => e.exists_cast(ci, i2, cz))
    })),
  )

  e.assert_context(
    cp,
    e.forall_instances(cp, p => `(not ${e.exists_cast(cp, p, ci, i => {
      const entry = cl_union[i]
      return pb_exists(entry, i2 => e.exists_cast(ci, i2, cn))
    })})`),

    e.forall_instances(cp, p => e.exists_cast(cp, p, ci, i => {
      const entry = cl_pred[i]
      return pb_exists(entry, i2 => e.exists_cast(ci, i2, cz))
    })),
  )

  return e
}


export default gen