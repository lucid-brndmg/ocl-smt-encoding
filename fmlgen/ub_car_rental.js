import {ModelEnv, pb_eq, pb_exists, pb_singleton, pb_sum} from "./index.js";
import {gen_fml} from "./utils.js"

import path from "path";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const opt_conflict_free = opts.sat
  const uml = {
    logic: "SLIRA",
    name: `car_rental`,
    tuples: {
      "Date": ["Int", "Int", "Int"]
    },
    classes: {
      person: {
        firstname: "NullableString",
        lastname: "NullableString",
        age: "Int",
        is_married: "Bool"
      },
      customer: {
        _extends: ["person"],
        address: "String"
      },
      employee: {
        _extends: ["person"],
        salary: "Real"
      },

      rental: {
        from_date: "Date",
        until_date: "Date"
      },
      branch: {
        location: "String"
      },
      car_group: {
        kind: "String"
      },
      car: {
        id: "String"
      },
      service_depot: {
        location: "String"
      },
      check: {
        description: "String"
      }
    },
    assoc: [
      {
        participants: [
          ["employee", "manager", null, 1, null],
          ["branch", "managed_branch", 0, null, 1]
        ]
      },
      {
        participants: [
          ["employee", "employee", null, null, null],
          ["branch", "employer", null, 1, null]
        ]
      },
      {
        participants: [
          ["branch", "branch", null, 1, null],
          ["car", "car", null, null, null]
        ]
      },
      {
        participants: [
          ["branch", "branch", null, null, null],
          ["car_group", "car_group", null, null, null]
        ]
      },
      {
        participants: [
          ["car_group", "car_group", null, 1, null],
          ["car", "car", null, null, null]
        ]
      },
      {
        participants: [
          ["rental", "rental", null, null, null],
          ["customer", "customer", null, 1, null]
        ]
      },
      {
        participants: [
          ["rental", "rental", null, null, null],
          ["branch", "branch", null, 1, null]
        ]
      },
      {
        participants: [
          ["rental", "rental", null, null, null],
          ["car_group", "car_group", null, 1, null]
        ]
      },
      {
        participants: [
          ["rental", "rental", 0, null, 1],
          ["car", "car", 0, null, 1]
        ]
      },
      {
        participants: [
          ["car_group", "higher", 0, null, 1],
          ["car_group", "lower", 0, null, 1]
        ]
      },
      {
        participants: [
          ["service_depot", "service_depot", 0, null, 1],
          ["check", "check", null, null, null],
          ["car", "car", null, null, null]
        ]
      }
    ]
  }

  const e = new UnboundedEnv(uml, opts)

  const cp = "person"
  const ce = "employee"
  const cb = "branch"
  const ccg = "car_group"
  const cc = "car"
  const cr = "rental"
  const cq = "quality"

  // const kcg = e.bound_of(ccg)

  const mksn = e.mk_nil("NullableString")
  // const mks = e.mk("NullableString")
  const dt_date = "Date"

  const op_date_is_before_src = `
(define-fun date_is_before ((target ${dt_date}) (cmp ${dt_date})) Bool (and 
  (<= (${e.tuple("Date", 0)} target) (${e.tuple("Date", 0)} cmp))
))
`
  e.def_fun(`date_is_before`, op_date_is_before_src, true)

  const op_date_is_after_src = `
(define-fun date_is_after ((target ${dt_date}) (cmp ${dt_date})) Bool (and 
  (> (${e.tuple("Date", 0)} target) (${e.tuple("Date", 0)} cmp))
))
`
  e.def_fun(`date_is_after`, op_date_is_after_src, true)


  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => `(> ${e.attr(cp, "age", p)} 0)`),
    e.forall_instances(cp, (p) => `(and
    (distinct ${e.attr(cp, "firstname", p)} ${mksn})
    (distinct ${e.attr(cp, "lastname", p)} ${mksn})
  )`),
    e.forall_instances(cp, (p) => `(and 
    (> ${e.attr(cp, "age", p)} 0)
    (< ${e.attr(cp, "age", p)} 150)
  )`),
  )

  if (!opt_conflict_free) {
    // unsat
    // employee.employer always > 0 => p0 = false
    // which implies: employee.managed_branch = 0
    // but managed_branch must be inst once, and each managed_branch connects to 1 employee (manager)
    // thus, contradiction

    e.assert_context(
      ce,
      e.forall_instances(ce, (emp) => `(xor
    ${e.is_empty(ce, emp, ["employer"])}
    ${e.is_empty(ce, emp, ["managed_branch"])}
  )`)
    )
  }


  e.assert_context(
    cb,
    e.forall_instances(cb, (b) => e.assoc_path_includes_all(cb, b, ["employee"], ["manager"])),
    e.forall_instances(cb, (b) => e.forall_navigate(cb, b, ["employee"], ([b, emp]) => e.exists_navigate(cb, b, ["manager"], ([b, emp2]) => `(=> 
    (distinct ${emp} ${emp2})
    (> ${e.attr(ce, "salary", emp2)} ${e.attr(ce, "salary", emp)})
  )`))),
  )

  e.assert_context(
    ccg,
    e.forall_instances(ccg, (cg) => `(and
    ${e.forall_navigate(ccg, cg, ["higher"], (_, h) => `(distinct ${h} ${cg})`)}
    ${e.forall_navigate(ccg, cg, ["lower"], (_, l) => `(distinct ${l} ${cg})`)}    
  )`),

    e.forall_instances(ccg, (cg) => `(and
    ${e.forall_navigate(ccg, cg, ["higher", "higher"], (_, h) => `(distinct ${h} ${cg})`)}
    ${e.forall_navigate(ccg, cg, ["lower", "lower"], (_, l) => `(distinct ${l} ${cg})`)}    
  )`),

  //   e.forall_instances(ccg, ([cg]) => `(and
  //   (not ${pb_eq(e.assoc_vec(ccg, cg, ["higher", "higher"]), pb_singleton(kcg*kcg, cg))})
  //   (not ${pb_eq(e.assoc_vec(ccg, cg, ["lower", "lower"]), pb_singleton(kcg*kcg, cg))})
  // )`)
  )

  e.assert_context(
    cc,
    e.forall_instances(cc, (c) => `(or 
    ${e.is_empty(cc, c, ["rental"])}
    ${e.is_empty(cc, c, ["service_depot"])}
  )`),
    e.forall_instances(cc, (c) => e.size_leq1(cc, c, ["service_depot"]))
  )

  e.assert_context(
    cr,
    e.forall_instances(cr, (r) => e.assoc_path_includes_all(cr, r, ["branch", "car_group"], ["car_group"])),

    e.forall_instances(cr, r => e.exists_instances(cr, r2 => `(and 
      (distinct ${r} ${r2})
      ${e.path_eq(cr, r, ["car"], cr, r2, ["car"])}
      (date_is_before ${e.attr(cr, "from_date", r2)} ${e.attr(cr, "until_date", r)})
      (date_is_after ${e.attr(cr, "until_date", r2)} ${e.attr(cr, "from_date", r)})
    )`)),

  //   e.forall_instances(cr, ([r]) => `(not
  //   ${pb_exists(e.assoc_filter_pb(e.instances(cr), cr, r2 => r2 !== r), r2 => `(and
  //     ${e.path_eq(cr, r, ["car"], cr, r2, ["car"])}
  //     (date_is_before ${e.attr(cr, "from_date", r2)} ${e.attr(cr, "until_date", r)})
  //     (date_is_after ${e.attr(cr, "until_date", r2)} ${e.attr(cr, "from_date", r)})
  //   )`)}
  // )`)
  )

  return e
}

export default gen