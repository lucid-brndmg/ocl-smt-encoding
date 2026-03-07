import {ModelEnv, pb_eq, pb_singleton} from "./index.js";
import fs from "fs";
import path from "path";
import {gen_fml} from "./utils.js"
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const uml = {
    name: "percom",
    logic: "SLIA",
    classes: {
      person: {name: "String"},
      company: {name: "String"},
      job: {salary: "Int"}
    },
    assoc: [
      {
        participants: [
          ["person", "employee", null, 1, null],
          ["job", "job", null, null, null]
        ],
      },
      {
        participants: [
          ["company", "employer", null, 1, null],
          ["job", "job", null, null, null]
        ],
      },
      {
        participants: [
          ["job", "boss", 0, null, 1],
          ["job", "worker", null, null, null]
        ]
      }
    ]
  }

  const e = new UnboundedEnv(uml, opts)

  const cp = "person"
  const cc = "company"
  const cj = "job"

  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => e.assoc_each_distinct(cp, p, [], (p, p2) => `(distinct 
  ${e.attr(cp, "name", p)} 
  ${e.attr(cp, "name", p2)}
  )`))
  )

  e.assert_context(
    cc,
    e.forall_instances(cc, (p) => e.assoc_each_distinct(cc, p, [], (p, p2) => `(distinct 
  ${e.attr(cc, "name", p)} 
  ${e.attr(cc, "name", p2)}
  )`))
  )

  e.assert_context(
    cj,
  //   e.forall_instances(cj, ([p]) => e.assoc_each_distinct(cj, p, [], (p, p2) => `(or
  //   (not ${pb_eq(e.assoc_vec(cj, p, ["employee"]), e.assoc_vec(cj, p2, ["employee"]))})
  //   (not ${pb_eq(e.assoc_vec(cj, p, ["employer"]), e.assoc_vec(cj, p2, ["employer"]))})
  // )`)),

    e.forall_instances(cj, (p) => e.assoc_each_distinct(cj, p, [], (p, p2) => `(or 
    (not ${e.path_eq(cj, p, ["employee"], cj, p2, ["employee"])})
    (not ${e.path_eq(cj, p, ["employer"], cj, p2, ["employer"])})    
  )`)),



    // (e.assoc_vec(cj, j, ["employer"]), e.assoc_vec(cj, j2, ["employer"]))
    e.forall_instances(cj, (j) => e.forall_navigate(cj, j, ["worker"], ([j, j2]) => e.path_eq(cj, j, ["employer"], cj, j2, ["employer"]))),

    e.forall_instances(cj, (j) => e.forall_navigate(cj, j, ["worker"], ([j, j2]) => `(<
    ${e.attr(cj, "salary", j2)}
    ${e.attr(cj, "salary", j)}
  )`)),

    // job->closure(worker)
    // unsupported

    // forall i ((closure R) j i) => i not-in

    // e.forall_instances(cj, ([j]) => {
    //   const cl = e.assoc_closure_pb(
    //     cj,
    //     e.assoc_vec(cj, j, ["worker"]),
    //     (a, b) => e.assoc_coords(cj, "worker", a, b),
    //     `cl_worker_${j}`
    //   )
    //   return `(not ${cl[j]})`
    // })
  )

  return e
}

export default gen

