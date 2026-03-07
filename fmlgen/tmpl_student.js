import {ModelEnv} from "./index.js";
import {gen_fml, mk_options} from "./utils.js"
import fs from "fs";
import path from "path";

const gen = opts => {
  const opt_sat = opts.sat
  const uml = {
    name: `student`,
    logic: "LIA",
    classes: {
      university: {},
      department: {code: "Int", fund: "Int"},
      child: {},
      person: { _extends: ["child"], age: "Int" },
      student: {_extends: ["person"], id: "Int", year: "Int"},
      module: { code: "Int", year: "Int" }
    },
    assoc: [
      {
        participants: [
          ["university", "university", null, 1, null],
          ["department", "department", 1, null, null]
        ],
      },
      {
        participants: [
          ["department", "department", null, 1, null],
          ["student", "student", 1, null, null]
        ],
      },
      {
        participants: [
          ["student", "student", null, 1, null],
          ["module", "modules", null, null, null]
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)
  // e.options.core = true
  // e.options.assertion_whitelist.push(
  //   // "debugging" the formulae XD
  //   "assert_person_0_0",
  //   "assert_student_0_0",
  //   "assert_student_0_4"
  // )

  const cs = "student"
  const cu = "university"
  const cd = "department"
  const cp = "person"
  const cm = "module"

  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => `(and 
    ${e.app(">", e.attr(cp, "age", p), 0)}
    ${e.app("<", e.attr(cp, "age", p), 18)}
  )`)
  )
  // e.app(">", e.attr(cp, "age", p), 18)
  if (!opt_sat) {
    e.unnamed(e.forall_instances(cs, (s) => e.exists_cast(cs, s, cp, (p) => `(> ${e.attr(cp, "age", p)} 18)`)))
    e.unnamed(e.forall_instances(cs, (s) => {
      return e.forall_navigate(cs, s, ["modules"], ([s, m]) => `(= ${e.attr(cs, "year", s)} ${e.attr(cm, "year", m)})`)
    }))
  }

  e.assert_context(
    cs,

    e.forall_instances(cs, (s) => {
      const e1 = `(>= ${e.attr(cs, "year", s)} 1)` // e.app(">=", e.attr(cs, "year", s), 1)
      const e2 = `(<= ${e.attr(cs, "year", s)} 6)`
      return `(and ${e1} ${e2})`
    }),

    e.forall_instances(cs, (s) => {
      return e.assoc_each_distinct(cs, s, [], (i, j) => `(distinct ${e.attr(cs, "id", i)} ${e.attr(cs, "id", j)})`)
    }),

    `(and 
  ${e.exists_instances(cs, (s) => e.app("=", e.attr(cs, "year", s), 6))} 
  ${e.exists_instances(cs, (s) => e.app("<", e.attr(cs, "year", s), 6))}
  )`,

    e.forall_instances(cs, (s) => {
      return e.app(">", e.assoc_path_size_pb(cs, s, [`modules`]), 0)
    }),
  )

  e.assert_context(
    cm,
    e.forall_instances(cm, (m) => `(and 
    ${e.app(">=", e.attr(cm, "year", m), 1)}
    ${e.app("<=", e.attr(cm, "year", m), 5)}
  )`)
  )

  return e
}

export default gen

