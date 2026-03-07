import {UnboundedEnv} from "./unbounded.js";
import {pb_sum} from "./index.js";
import {gen_fml, mk_options} from "./utils.js";

const gen = opts => {
  const sat = opts.sat
  const card = sat ? [0, null, 1] : [null, 1, null]

  const uml = {
    name: `pr`,
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

  const e = new UnboundedEnv(uml, opts)
  const cp = "paper"
  const cr = "researcher"

  const size_constr = () => {
    const n = 5
    const xs = new Array(n).fill(undefined).map((_, i) => i)
    const cs = e.class_sort()
    const qvs = xs.map(i => `p${i}`)
    const qvsp = qvs.map(v => `(${v} ${cs})`)
    return `(not (exists (${qvsp.join(" ")}) (and 
      ${qvs.map(v => e.attr(cp, "student_paper", v)).join(" ")}
      (distinct ${qvs.join(" ")})
    )))`
  }

  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => `(=
      ${e.attr(cp, "student_paper", p)}
      ${e.exists_navigate(cp, p, ["author"], ([p, r]) => e.attr(cr, "is_student", r))}
    )`),

    `(and 
      ${e.exists_instances(cp, (p) => e.attr(cp, "student_paper", p))}
      ${size_constr()}
    )`,
    // `(and
    //   ${e.exists_instances(cp, (p) => e.attr(cp, "student_paper", p))}
    //   (< ${pb_sum(e.assoc_filter_pb(e.instances(cp), cp, p => e.attr(cp, "student_paper", p)))} 5)
    // )`,

    e.forall_instances(cp, (p) => `(< ${e.attr(cp, "word_count", p)} 10000)`),
    e.forall_instances(cp, (p) => e.forall_navigate(cp, p, ["referee"], ([p, r]) => `(not ${e.attr(cr, "is_student", r)})`))
  )

  if (!sat) {
    e.assert_context(
      cr,
      e.forall_instances(cr, (r) => e.assoc_path_excludes_all(cr, r, ["submission"], ["manuscript"]))
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