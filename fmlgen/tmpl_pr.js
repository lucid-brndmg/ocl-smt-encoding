import {ModelEnv, pb_sum} from "./index.js";
import fs from "fs"
import path from "path";
import {gen_fml, mk_options} from "./utils.js"

const gen = opts => {
  const opt_sat = opts.sat
  const card = opt_sat ? [0, null, 1] : [null, 1, null]

  const uml = {
    name: `pr_${opt_sat ? "sat" : "unsat"}`,
    logic: "LIA",
    classes: {
      paper: {title: "String", word_count: "Int", student_paper: "Bool"},
      researcher: {name: "String", is_student: "Bool"},
    },
    assoc: [
      {
        participants: [
          ["paper", "manuscript", ...card],
          ["researcher", "author", 1, null, 2],
        ]
      },
      {
        participants: [
          ["paper", "submission", ...card],
          ["researcher", "referee", null, 3, null],
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)

  const cp = "paper"
  const cr = "researcher"

  e.assert_context(
    cp,
    e.forall_instances(cp, p => `(=
      ${e.attr(cp, "student_paper", p)}
      ${e.exists_navigate(cp, p, ["author"], ([p, r]) => e.attr(cr, "is_student", r))}
    )`),

    `(and 
      ${e.exists_instances(cp, p => e.attr(cp, "student_paper", p))}
      (< ${pb_sum(e.assoc_filter_pb(e.instances(cp), cp, p => e.attr(cp, "student_paper", p)))} 5)
    )`,

    e.forall_instances(cp, (p) => `(< ${e.attr(cp, "word_count", p)} 10000)`),
    e.forall_instances(cp, (p) => e.forall_navigate(cp, p, ["referee"], ([p, r]) => `(not ${e.attr(cr, "is_student", r)})`))
  )

  if (!opt_sat) {
    e.assert_context(
      cr,
      e.forall_instances(cr, (r) => `(not ${e.assoc_path_includes(cr, r, ["submission"], ["manuscript"])})`)
    )
  }


  return e
}

// const opts = mk_options(true, false, 10)
// opts.filename_suffix = "_ig"
// opts.ig_class = "paper"
// opts.ig_attribute = null
// opts.ig_bound = 3
// gen_fml(gen(opts))

export default gen