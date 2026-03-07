import {ModelEnv, pb_sum} from "./index.js";
import fs from "fs";
import path from "path";
import {gen_fml} from "./utils.js"

const gen = opts => {
  const uml = {
    name: `ex`,
    logic: "LIA",
    classes: {
      employee: {name: "String", salary: "Int"},
      department: {name: "String", location: "String", budget: "Int"},
      project: {name: "String", budget: "Int"},
    },
    assoc: [
      {
        participants: [
          ["employee", "employee", null, null, null],
          ["department", "department", 1, null, null]
        ]
      },
      {
        participants: [
          ["employee", "employee", null, null, null],
          ["project", "project", null, null, null]
        ]
      },
      {
        participants: [
          ["department", "department", null, 1, null],
          ["project", "project", null, null, null]
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)
  const ce = "employee"
  const cd = "department"
  const cp = "project"

  e.assert_context(
    cd,
    e.forall_instances(cd, d => `(>= ${pb_sum(e.assoc_vec(cd, d, ["employee"]))} ${pb_sum(e.assoc_vec(cd, d, ["project"]))})`),
  )

  e.assert_context(
    ce,
    e.forall_instances(ce, ee => e.assoc_each_distinct(ce, ee, [], (e1, e2) => `(=>
    (> ${pb_sum(e.assoc_vec(ce, e1, ["project"]))} ${pb_sum(e.assoc_vec(ce, e2, ["project"]))})
    (> ${e.attr(ce, "salary", e1)} ${e.attr(ce, "salary", e2)})
  )`))
  )

  e.assert_context(
    cp,
    e.forall_instances(cp, p => e.exists_navigate(cp, p, ["department"], ([p, d]) => `(<= ${e.attr(cp, "budget", p)} ${e.attr(cd, "budget", d)})`)),
    e.forall_instances(cp, p => e.assoc_path_includes_all(cp, p, ["department", "employee"], ["employee"]))
  )

  e.unnamed(e.forall_instances(cp, d => `(>= ${e.attr(cp, "budget", d)} 0)`))
  e.unnamed(e.forall_instances(ce, ee => `(>= ${e.attr(ce, "salary", ee)} 0)`))
  e.unnamed(e.forall_instances(cd, d => `(>= ${e.attr(cd, "budget", d)} 0)`))

  return e
}

export default gen
